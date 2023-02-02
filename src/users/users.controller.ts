import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TokenPayload } from '../auth/tokenPayload.decorator';
import { JwtTokenPayload } from '../auth/types';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from './user.entity';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get current user information',
    description: 'Returns current user information based on access token',
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
}
