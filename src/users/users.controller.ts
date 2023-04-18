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
  SerializeOptions,
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
import { AccessTokenPayload } from '../auth/types';
import { UserTokensService } from './userTokens.service';
import { UserToken } from './userToken.entity';
import { EditPasswordDto } from './dto/editPassword.dto';
import { UserGroupGuard } from '../auth/userGroup.guard';

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
  @SerializeOptions({
    groups: ['user'],
  })
  @UseGuards(UserGroupGuard)
  @ApiOperation({
    summary: 'Get current user information',
    description: 'Returns current user information based on access token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: User,
    description: 'Returns logged in `User`',
  })
  async me(@TokenPayload() payload: AccessTokenPayload) {
    return this.usersService.findById(payload.userId);
  }

  @Patch('profile')
  @UseGuards(UserGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @UseFilters(FileRemovalFilter)
  @SerializeOptions({
    groups: ['user'],
  })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Edit current user profile',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: User,
    description: 'Returns updated `User`',
  })
  editProfile(@CurrentUser() user: User, @UploadedFile() avatar: Express.Multer.File, @Body() body: EditProfileDto) {
    return this.usersService.editProfile(user, body, avatar);
  }

  @Patch('password')
  @UseGuards(UserGuard)
  @ApiOperation({
    summary: 'Edit current user password. Need original password for this operation.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: User,
    description: 'Returns current `User`',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation errors, including wrong current password validation',
  })
  async editPassword(@CurrentUser() user: User, @Body() body: EditPasswordDto) {
    const isOldPasswordValid = await user.validatePassword(body.oldPassword);

    if (!isOldPasswordValid) {
      throw new HttpException({ oldPassword: ['Not valid'] }, HttpStatus.BAD_REQUEST);
    }

    return this.usersService.updatePassword(user, body.newPassword);
  }

  @Get('tokens')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all tokens information of currently logged in user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserToken,
    isArray: true,
    description: 'Returns array of all `UserToken`s',
  })
  tokens(@TokenPayload() { userId }: AccessTokenPayload) {
    return this.userTokensService.findByUserId(userId);
  }

  @Delete('/tokens/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete one UserToken by id',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Token was successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'This token does not belong to current user or does not exist',
  })
  async removeToken(@Param('id', ParseIntPipe) id: number, @TokenPayload() { userId }: AccessTokenPayload) {
    const result = await this.userTokensService.removeByUserIdAndId(id, userId);

    if (!result.affected) {
      throw new HttpException('You cannot do this', HttpStatus.FORBIDDEN);
    }
  }

  @Delete('/allTokens')
  @HttpCode(HttpStatus.UNAUTHORIZED)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete all UserTokens of currently logged in user, including current',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'All tokens were deleted, forcing logout',
  })
  async removeAll(@TokenPayload() { userId }: AccessTokenPayload) {
    return this.userTokensService.removeAllByUserId(userId);
  }
}
