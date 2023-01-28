import {
  ClassSerializerInterceptor,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CurrentUser } from './currentUser.decorator';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { JwtRefreshAuthGuard } from './jwtRefresh-auth.guard';
import { RefreshTokenPayload } from './tokenPayload.decorator';
import { JwtRefreshTokenPayload } from './types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(200)
  @ApiOperation({
    summary: 'User login',
    description:
      'Provide LoginDTO and receive User object JSON and Set-Cookie header which contains both AccessToken and RefreshToken',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    type: User,
    description: 'Returned logged in User. Also, AccessToken and RefreshToken cookies have been set',
  })
  @ApiUnauthorizedResponse({ description: 'Wrong credentials were provided in LoginDto' })
  async login(
    @CurrentUser() user: User,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessTokenCookie = await this.authService.getCookieWithJwtAccessToken(user.id);
    const refreshTokenCookie = await this.authService.getCookieWithRefreshToken(user.id, userAgent);

    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    return user;
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(204)
  @ApiCookieAuth('refresh-token')
  @ApiOperation({
    summary: 'Get new access token',
    description: 'Provide RefreshToken cookie to get a new AccessToken in a cookie',
  })
  @ApiNoContentResponse({ description: 'New AccessToken has been sent with the Set-Cookie header' })
  @ApiUnauthorizedResponse({
    description:
      'Non-existing, incorrect or expired refresh token.\nAlso, if the device differs it will remove the token from the database.',
  })
  async refresh(@RefreshTokenPayload() payload: JwtRefreshTokenPayload, @Res({ passthrough: true }) res: Response) {
    const accessTokenCookie = await this.authService.getCookieWithJwtAccessToken(payload.userId);
    res.setHeader('Set-Cookie', accessTokenCookie);
  }

  @Post('logout')
  @HttpCode(204)
  @ApiOperation({
    summary: 'User logout',
    description:
      'Provide RefreshToken cookie to remove it from the database. If no cookies are provided it will still return 204',
  })
  @ApiNoContentResponse({
    description:
      'Auth cookies have been unset and the associated UserToken has been removed from the database if it existed at the time of request',
  })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.cookies['RefreshToken']);
    res.setHeader('Set-Cookie', this.authService.getCookiesForLogout());
  }
}
