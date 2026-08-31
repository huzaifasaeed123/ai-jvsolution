import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserStatus } from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { UsersRepository } from '../users/users.repository';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  accessLevel: string;
  /** Token version. Mismatch means the token was revoked. */
  tv?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly users: UsersRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret')!,
    });
  }

  /**
   * Return value is attached to request.user.
   *
   * This deliberately reads the user on every request rather than trusting the
   * token's claims. A stateless check cannot see that an account was suspended,
   * deleted, or had its role changed since the token was issued — it would keep
   * honouring the old claims until the token expired. The cost is one indexed
   * primary-key lookup; the benefit is that suspension and forced sign-out take
   * effect on the very next request.
   */
  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.users.findById(payload.sub);
    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Account no longer exists');
    }
    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('This account is suspended');
    }
    // A bumped tokenVersion revokes every token issued before the bump.
    if ((payload.tv ?? 0) !== user.tokenVersion) {
      throw new UnauthorizedException('Session has been signed out');
    }

    // Role and access level come from the record, not the token, so an admin's
    // change applies immediately instead of at the next login.
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      accessLevel: user.accessLevel,
    };
  }
}
