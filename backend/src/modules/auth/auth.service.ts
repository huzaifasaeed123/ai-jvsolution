import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Role, User, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { UsersService, SafeUser } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { RegisterDto } from './dto/register.dto';
import { GoogleAuthService, GoogleProfile } from './google.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './jwt.strategy';

export interface AuthResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly usersRepo: UsersRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly google: GoogleAuthService,
  ) {}

  /**
   * Handles issued by the Google callback, held only until the frontend
   * redeems them. In memory on purpose: they live for seconds, are single-use,
   * and putting them in Postgres would mean a write on every sign-in for data
   * that is worthless a moment later. A multi-instance deployment would need
   * Redis here — noted rather than pretended away.
   */
  private readonly pendingGrants = new Map<
    string,
    { result: AuthResult; isNew: boolean; expiresAt: number }
  >();

  /** Complete the Google round trip and stash the tokens behind a handle. */
  async googleCallback(code: string): Promise<{ handle: string; isNew: boolean }> {
    const profile: GoogleProfile = await this.google.fetchProfile(code);
    const { user, isNew } = await this.google.resolveUser(profile);
    const result = await this.buildResult(user);

    this.sweepExpiredGrants();
    const { handle, hash } = GoogleAuthService.newHandle();
    this.pendingGrants.set(hash, { result, isNew, expiresAt: Date.now() + 120_000 });
    return { handle, isNew };
  }

  /** Redeem a handle exactly once, server to server. */
  redeemGoogleGrant(handle: string): AuthResult & { isNew: boolean } {
    const hash = GoogleAuthService.hashHandle(handle);
    const grant = this.pendingGrants.get(hash);
    this.pendingGrants.delete(hash); // single use, whether or not it was valid
    if (!grant || grant.expiresAt < Date.now()) {
      throw new UnauthorizedException('This sign-in link has expired. Please try again.');
    }
    return { ...grant.result, isNew: grant.isNew };
  }

  /**
   * Onboarding: a Google user picking Owner / Developer / Investor / Government.
   * Only callable while the role is still unconfirmed, so it cannot be used
   * later as a self-service privilege change.
   */
  async confirmRole(userId: string, role: Role): Promise<SafeUser> {
    if (role === Role.ADMIN) {
      throw new ForbiddenException('This role cannot be self-assigned');
    }
    const user = await this.users.findById(userId);
    if (!user || user.deletedAt) throw new UnauthorizedException('User no longer exists');
    if (user.roleConfirmed) {
      throw new ForbiddenException('Your role has already been set');
    }
    const updated = await this.usersRepo.update(userId, { role, roleConfirmed: true });
    return UsersService.toSafe(updated);
  }

  private sweepExpiredGrants(): void {
    const now = Date.now();
    for (const [k, v] of this.pendingGrants) {
      if (v.expiresAt < now) this.pendingGrants.delete(k);
    }
  }

  async register(dto: RegisterDto): Promise<AuthResult> {
    // Admin accounts are never self-registerable (privilege-escalation guard).
    if (dto.role === Role.ADMIN) {
      throw new ForbiddenException('This role cannot be self-registered');
    }
    const existing = await this.users.findByEmail(dto.email.toLowerCase());
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }
    const passwordHash = await argon2.hash(dto.password);
    const user = await this.users.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      fullName: dto.fullName,
      role: dto.role,
      country: dto.country,
    });
    return this.buildResult(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.users.findByEmail(dto.email.toLowerCase());
    if (!user) throw new UnauthorizedException('Invalid email or password');

    // An account created through Google has no password. Saying so would turn
    // this endpoint into an account-enumeration oracle — anyone could discover
    // which addresses are registered, and which of those use Google. It fails
    // exactly like a wrong password instead.
    if (!user.passwordHash) throw new UnauthorizedException('Invalid email or password');

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    // Deleted accounts are indistinguishable from a wrong password, so the
    // response cannot be used to probe which addresses are registered.
    if (user.deletedAt) throw new UnauthorizedException('Invalid email or password');
    // A suspension is stated plainly — the person needs to know why, and they
    // have already proved they own the account.
    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException(
        user.suspendedReason
          ? `This account is suspended: ${user.suspendedReason}`
          : 'This account is suspended. Contact the platform administrator.',
      );
    }

    const fresh = await this.usersRepo.update(user.id, { lastLoginAt: new Date() });
    return this.buildResult(fresh);
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const user = await this.users.findById(payload.sub);
    if (!user || user.deletedAt) throw new UnauthorizedException('User no longer exists');
    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('This account is suspended');
    }
    // Refuse a refresh token issued before the last revocation, so a forced
    // sign-out cannot be undone by simply refreshing.
    if ((payload.tv ?? 0) !== user.tokenVersion) {
      throw new UnauthorizedException('Session has been signed out');
    }
    return this.buildResult(user);
  }

  async me(userId: string): Promise<SafeUser> {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException('User no longer exists');
    return UsersService.toSafe(user);
  }

  private async buildResult(user: User): Promise<AuthResult> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      accessLevel: user.accessLevel,
      tv: user.tokenVersion,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('jwt.accessSecret'),
        expiresIn: this.config.get<string>('jwt.accessTtl') as JwtSignOptions['expiresIn'],
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: this.config.get<string>('jwt.refreshTtl') as JwtSignOptions['expiresIn'],
      }),
    ]);
    return { user: UsersService.toSafe(user), accessToken, refreshToken };
  }
}
