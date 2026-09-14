import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role, User, UserStatus } from '@prisma/client';
import { randomBytes, createHash } from 'crypto';
import { UsersRepository } from '../users/users.repository';

/** What Google's userinfo/ID token gives us, narrowed to what we use. */
export interface GoogleProfile {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

/**
 * Google sign-in over the Authorization Code flow.
 *
 * One button covers sign-up and sign-in, because OAuth does not distinguish
 * them: the click creates the account when there is none and signs in when
 * there is. Four outcomes are possible and each is handled explicitly in
 * `resolveUser` below.
 *
 * Scopes are limited to openid/email/profile. Those are non-sensitive, so this
 * needs no Google verification review, and it grants no access to Gmail,
 * Drive, Calendar or Contacts.
 */
@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger('GoogleAuth');

  constructor(
    private readonly config: ConfigService,
    private readonly users: UsersRepository,
  ) {}

  get enabled(): boolean {
    return this.config.get<boolean>('google.enabled') ?? false;
  }

  private assertEnabled(): void {
    if (!this.enabled) {
      throw new ServiceUnavailableException('Google sign-in is not configured');
    }
  }

  /**
   * Build the consent URL, plus the `state` that protects the round trip.
   *
   * `state` is returned to the caller so it can be stored in a short-lived
   * httpOnly cookie and compared on the way back; without that check an
   * attacker can feed a victim's browser their own authorization code (CSRF
   * login) and have the victim end up signed into the attacker's account.
   */
  buildAuthUrl(): { url: string; state: string } {
    this.assertEnabled();
    const state = randomBytes(32).toString('base64url');

    const params = new URLSearchParams({
      client_id: this.config.get<string>('google.clientId')!,
      redirect_uri: this.config.get<string>('google.redirectUri')!,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      // Ask for an account chooser rather than silently reusing the last
      // session, which is what people expect from an explicit sign-in click.
      prompt: 'select_account',
    });

    return { url: `${GOOGLE_AUTH_URL}?${params.toString()}`, state };
  }

  /** Exchange the one-time code for tokens, then read the profile. */
  async fetchProfile(code: string): Promise<GoogleProfile> {
    this.assertEnabled();

    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.config.get<string>('google.clientId')!,
        client_secret: this.config.get<string>('google.clientSecret')!,
        redirect_uri: this.config.get<string>('google.redirectUri')!,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      // Google's body names the client and redirect URI; log it for the
      // operator but never return it, since it describes our configuration.
      this.logger.error(`Token exchange failed (${tokenRes.status}): ${await tokenRes.text()}`);
      throw new BadRequestException('Could not complete Google sign-in');
    }

    const { access_token } = (await tokenRes.json()) as { access_token?: string };
    if (!access_token) throw new BadRequestException('Could not complete Google sign-in');

    const infoRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!infoRes.ok) {
      this.logger.error(`Userinfo failed (${infoRes.status})`);
      throw new BadRequestException('Could not complete Google sign-in');
    }

    const profile = (await infoRes.json()) as Partial<GoogleProfile>;
    if (!profile.sub || !profile.email) {
      throw new BadRequestException('Google did not return an email address');
    }

    return {
      sub: profile.sub,
      email: profile.email.toLowerCase(),
      email_verified: profile.email_verified === true,
      name: profile.name,
      picture: profile.picture,
    };
  }

  /**
   * Map a Google profile onto a user record.
   *
   * The four cases, in the order they are checked:
   *
   *  1. Known googleId        — returning user, sign in.
   *  2. Email + verified      — an existing password account; link the two so
   *                             either method works from then on.
   *  3. Email + NOT verified  — refuse. Linking on an unverified provider
   *                             claim is a known account-takeover route:
   *                             anyone who can attach an address they do not
   *                             own would inherit the account and its data.
   *                             Never link on an email match alone.
   *  4. No match              — create the account from the profile, with no
   *                             password and an unconfirmed role.
   */
  async resolveUser(profile: GoogleProfile): Promise<{ user: User; isNew: boolean }> {
    const byGoogleId = await this.users.findByGoogleId(profile.sub);
    if (byGoogleId) {
      this.assertUsable(byGoogleId);
      const user = await this.users.update(byGoogleId.id, {
        lastLoginAt: new Date(),
        // Keep the display name and picture in step with the Google account,
        // but never overwrite a picture the user uploaded themselves.
        ...(profile.name ? { fullName: profile.name } : {}),
        ...(profile.picture && !byGoogleId.avatarUrl ? { avatarUrl: profile.picture } : {}),
      });
      return { user, isNew: false };
    }

    const byEmail = await this.users.findByEmail(profile.email);
    if (byEmail) {
      if (!profile.email_verified) {
        throw new ForbiddenException(
          'That Google account has not verified this email address. Sign in with your password first.',
        );
      }
      this.assertUsable(byEmail);
      const user = await this.users.update(byEmail.id, {
        googleId: profile.sub,
        lastLoginAt: new Date(),
        ...(profile.picture && !byEmail.avatarUrl ? { avatarUrl: profile.picture } : {}),
      });
      return { user, isNew: false };
    }

    // Brand new. A provisional role keeps every guard and serializer working —
    // they all assume role is non-null — while roleConfirmed:false is what
    // routes the person to onboarding to choose for themselves.
    const created = await this.users.create({
      email: profile.email,
      fullName: profile.name?.trim() || profile.email.split('@')[0],
      googleId: profile.sub,
      passwordHash: null,
      role: Role.DEVELOPER,
      roleConfirmed: false,
      avatarUrl: profile.picture ?? null,
      lastLoginAt: new Date(),
    });
    return { user: created, isNew: true };
  }

  /**
   * Same lifecycle rules the password path enforces. A suspended account must
   * not be able to slip back in through a second door.
   */
  private assertUsable(user: User): void {
    if (user.deletedAt) throw new UnauthorizedException('This account no longer exists');
    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException(
        user.suspendedReason
          ? `This account is suspended: ${user.suspendedReason}`
          : 'This account is suspended. Contact the platform administrator.',
      );
    }
  }

  /**
   * Opaque, single-use handle for the tokens.
   *
   * The callback runs in the browser's address bar, so the tokens themselves
   * must never travel in a query string — they would land in server logs,
   * browser history and any Referer header. The frontend redeems this instead,
   * server to server, and sets the httpOnly cookies itself.
   */
  static newHandle(): { handle: string; hash: string } {
    const handle = randomBytes(32).toString('base64url');
    return { handle, hash: createHash('sha256').update(handle).digest('hex') };
  }

  static hashHandle(handle: string): string {
    return createHash('sha256').update(handle).digest('hex');
  }
}
