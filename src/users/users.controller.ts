import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from './user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserGuard } from '../auth/user.guard';
import { CurrentUser } from '../auth/currentUser.decorator';
import { EditProfileDto } from './dto/editProfile.dto';
import { FileRemovalFilter } from './fileRemoval.filter';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TokenPayload } from '../auth/tokenPayload.decorator';
import { JwtTokenPayload } from '../auth/types';
import { UserTokensService } from './userTokens.service';
import { UserToken } from './userToken.entity';

@ApiTags('users')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({
  description: 'Incorrect access token',
})
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly userTokensService: UserTokensService) {}

  @Get('me')
  @UseGuards(UserGuard)
  @ApiOperation({
    summary: 'Get current user information',
    description: 'Returns current user information based on access token',
  })
  @ApiResponse({
    status: 200,
    type: User,
    description: 'Returns logged in `User`',
  })
  async me(@CurrentUser() user: User) {
    return user;
  }

  @Patch('profile')
  @UseGuards(UserGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @UseFilters(FileRemovalFilter)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Edit current user profile',
  })
  @ApiResponse({
    status: 200,
    type: User,
    description: 'Returns updated `User`',
  })
  editProfile(@CurrentUser() user: User, @UploadedFile() avatar: Express.Multer.File, @Body() body: EditProfileDto) {
    return this.usersService.editProfile(user, body, avatar);
  }

  @Get('tokens')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all tokens information of currently logged in user',
  })
  @ApiResponse({
    status: 200,
    type: UserToken,
    isArray: true,
    description: 'Returns array of all `UserToken`s',
  })
  tokens(@TokenPayload() tokenPayload: JwtTokenPayload) {
    const userId = tokenPayload.userId;
    return this.userTokensService.findByUserId(userId);
  }

  @Delete('/tokens/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete one UserToken by id',
  })
  @ApiResponse({
    status: 204,
    description: 'Token was successfully deleted',
  })
  async removeToken(@Param('id', ParseIntPipe) id: number, @TokenPayload() { userId }: JwtTokenPayload) {
    const result = await this.userTokensService.removeByUserIdAndId(id, userId);

    if (!result.affected) {
      throw new HttpException('You cannot do this', HttpStatus.UNAUTHORIZED);
    }
  }

  @Delete('/allTokens')
  @HttpCode(401)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete all UserTokens of currently logged in user, including current',
  })
  @ApiResponse({
    status: 401,
    description: 'All tokens were deleted, forcing logout',
  })
  async removeAll(@TokenPayload() { userId }: JwtTokenPayload) {
    return this.userTokensService.removeAllByUserId(userId);
  }
}
