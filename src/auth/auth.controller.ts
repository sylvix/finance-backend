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
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CurrentUser } from './currentUser.decorator';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { RefreshTokenGuard } from './refreshToken.guard';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    type: User,
    description: 'Returns logged in User. Also, AccessToken and RefreshToken cookies has been set',
  })
  @ApiUnauthorizedResponse({ description: 'Wrong credentials' })
  async login(
    @CurrentUser() user: User,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(user);
    const refreshTokenCookie = await this.authService.getCookieWithRefreshToken(user, userAgent);

    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    return user;
  }

  @UseGuards(RefreshTokenGuard)
  @ApiCookieAuth('refresh-token')
  @HttpCode(204)
  @Post('refresh')
  @ApiNoContentResponse({ description: 'New AccessToken has been sent with the Set-Cookie header' })
  @ApiUnauthorizedResponse({ description: 'Non-existing, incorrect or expired refresh token' })
  async refresh(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(user);
    res.setHeader('Set-Cookie', accessTokenCookie);
  }

  @HttpCode(204)
  @Post('logout')
  @ApiNoContentResponse({
    description: 'Unset RefreshToken cookie and removed the token from the database if it exists',
  })
  async logout(@CurrentUser() user: User, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(user, req.cookies['RefreshToken']);
    res.setHeader('Set-Cookie', this.authService.getCookiesForLogout());
  }
}
