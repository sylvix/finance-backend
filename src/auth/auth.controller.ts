import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Headers,
  HttpCode,
  Post,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from './currentUser.decorator';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtRefreshAuthGuard } from './jwtRefresh-auth.guard';
import { RefreshTokenPayload } from './tokenPayload.decorator';
import { JwtRefreshTokenPayload } from './types';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from './dto/userResponse.dto';
import { AccessTokenDto } from './dto/tokens.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    groups: ['user'],
  })
  @ApiOperation({
    summary: 'Register new user',
    description: 'Returns information of newly registered user and signs this user in',
  })
  @ApiCreatedResponse({
    type: UserResponseDto,
    description: 'Returns `UserResponseDto`',
  })
  @ApiBadRequestResponse({
    description: 'Validation errors',
  })
  async register(@Body() body: RegisterDto, @Headers('user-agent') userAgent: string) {
    return this.authService.register(body, userAgent);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    groups: ['user'],
  })
  @HttpCode(200)
  @ApiOperation({
    summary: 'User login',
    description: 'Provide LoginDto and receive UserResponseDto',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    type: UserResponseDto,
    description: 'Returns UserResponseDto with logged in user and both access and refresh tokens',
  })
  @ApiUnauthorizedResponse({ description: 'Wrong credentials were provided in LoginDto' })
  async login(@CurrentUser() user: User, @Headers('user-agent') userAgent: string) {
    return this.authService.createUserResponse(user, userAgent);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(200)
  @ApiBearerAuth('refresh-token')
  @ApiOperation({
    summary: 'Get new access token',
    description: 'Provide refresh token in `Authorization` header as `Bearer`',
  })
  @ApiOkResponse({
    description: 'Returns new access token',
    type: AccessTokenDto,
  })
  @ApiUnauthorizedResponse({
    description:
      'Non-existing, incorrect or expired refresh token.\nAlso, if the device differs it will remove the token from the database.',
  })
  async refresh(@RefreshTokenPayload() payload: JwtRefreshTokenPayload) {
    const accessToken = await this.authService.createAccessToken(payload.userId);
    return new AccessTokenDto(accessToken);
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
  async logout(@Headers('authorization') header: string) {
    await this.authService.logout(header);
  }
}
