import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { UsersRepository } from './users.repository';

/** Public-safe user shape (never exposes passwordHash). */
export type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  findByEmail(email: string) {
    return this.repo.findByEmail(email);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  create(data: Prisma.UserCreateInput) {
    return this.repo.create(data);
  }

  /** Strip sensitive fields before returning a user to any client. */
  static toSafe(user: User): SafeUser {
    const { passwordHash: _passwordHash, ...safe } = user;
    void _passwordHash;
    return safe;
  }
}
