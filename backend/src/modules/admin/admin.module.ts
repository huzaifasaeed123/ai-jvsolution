import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminUsersService } from './admin-users.service';
import { UsersModule } from '../users/users.module';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [UsersModule, AccessModule],
  controllers: [AdminController],
  providers: [AdminUsersService],
})
export class AdminModule {}
