import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TokenPayload } from '../auth/tokenPayload.decorator';
import { JwtTokenPayload } from '../auth/types';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from './user.entity';
import { RegisterDto } from './dto/register.dto';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access-token')
  @ApiOperation({
    summary: 'Get current user information',
    description: 'Returns current user information based on AccessToken',
  })
  @ApiResponse({
    status: 200,
    type: User,
    description: 'Returns logged in User',
  })
  @ApiNotFoundResponse({
    description: 'Error if user does not exist in the database',
  })
  @ApiUnauthorizedResponse({
    description: 'Incorrect access token',
  })
  async me(@TokenPayload() tokenPayload: JwtTokenPayload) {
    const user = this.usersService.findById(tokenPayload.userId);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    return user;
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register new user',
    description: 'Returns information of newly registered user.',
  })
  @ApiCreatedResponse({
    type: User,
    description: 'Returns new registered User',
  })
  @ApiBadRequestResponse({
    description: 'Validation errors',
  })
  async register(@Body() body: RegisterDto) {
    return this.usersService.register(body);
  }
}
