import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminContentService } from './admin-content.service';
import { AdminOversightService } from './admin-oversight.service';
import { AdminRepository } from './admin.repository';
import { UsersModule } from '../users/users.module';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [UsersModule, AccessModule],
  controllers: [AdminController],
  providers: [AdminUsersService, AdminContentService, AdminOversightService, AdminRepository],
})
export class AdminModule {}
