import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Role, User, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { UsersService, SafeUser } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { RegisterDto } from './dto/register.dto';
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
  ) {}

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
