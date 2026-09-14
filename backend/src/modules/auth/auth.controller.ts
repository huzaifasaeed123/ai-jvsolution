import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { GoogleCallbackDto, RedeemDto, ConfirmRoleDto } from './dto/google.dto';
import { GoogleAuthService } from './google.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly google: GoogleAuthService,
  ) {}

  @Public()
  @Get('google/status')
  @ApiOperation({ summary: 'Whether Google sign-in is configured on this deployment' })
  googleStatus() {
    // The frontend hides the button when this is false — a button that cannot
    // work is worse than no button at all.
    return { enabled: this.google.enabled };
  }

  @Public()
  @Get('google/url')
  @ApiOperation({ summary: 'Consent URL plus the state value to store and verify' })
  googleUrl() {
    return this.google.buildAuthUrl();
  }

  @Public()
  @Post('google/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange the authorization code for a single-use handle' })
  googleCallback(@Body() dto: GoogleCallbackDto) {
    return this.auth.googleCallback(dto.code);
  }

  @Public()
  @Post('google/redeem')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redeem the handle for tokens (server to server, once)' })
  googleRedeem(@Body() dto: RedeemDto) {
    return this.auth.redeemGoogleGrant(dto.handle);
  }

  @Patch('role')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set the role for a Google account that has not chosen one' })
  confirmRole(@CurrentUser() user: AuthUser, @Body() dto: ConfirmRoleDto) {
    return this.auth.confirmRole(user.id, dto.role);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Create an account (role: OWNER, DEVELOPER, INVESTOR, GOVERNMENT)' })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email + password' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange a refresh token for a new access token' })
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current authenticated user' })
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }
}
