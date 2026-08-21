import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Attaches request.user IF a valid token is present, but never rejects when it
 * is absent. Used on public routes that reveal more to authenticated owners
 * (e.g. opportunity detail shows confidential fields to its owner).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser>(_err: unknown, user: TUser): TUser {
    return user || (undefined as unknown as TUser);
  }
}
