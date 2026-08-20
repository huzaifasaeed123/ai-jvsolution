import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Authenticated user payload attached to the request by the JWT strategy. */
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  accessLevel: string;
}

/** Injects the current authenticated user into a controller handler. */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext): AuthUser | AuthUser[keyof AuthUser] => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return data ? request.user[data] : request.user;
  },
);
