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
  Post,
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
import { DeleteAccountDto } from './dto/deleteAccount.dto';

@ApiTags('users')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Invalid or expired access token' })
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userTokensService: UserTokensService,
  ) {}

  @Get('me')
  @SerializeOptions({ groups: ['user'] })
  @UseGuards(UserGroupGuard)
  @ApiOperation({ summary: 'Get current user profile' })
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
  @SerializeOptions({ groups: ['user'] })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update user profile' })
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
  @ApiOperation({ summary: 'List user refresh tokens' })
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
  @ApiOperation({ summary: 'Revoke specific UserToken' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'UserToken revoked successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Token not found or does not belong to user',
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
  @ApiOperation({ summary: 'Revoke all UserTokens' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'All UserTokens revoked, user logged out',
  })
  async removeAll(@TokenPayload() { userId }: AccessTokenPayload) {
    return this.userTokensService.removeAllByUserId(userId);
  }

  @Post('delete/me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(UserGuard)
  @ApiOperation({
    summary: 'Delete user account',
    description:
      'Delete user account and all associated groups, transfer if needed. Have to be POST so we can send some additional data with the request',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Account deleted successfully',
  })
  async deleteAccount(@CurrentUser() user: User, @Body() deleteAccountDto: DeleteAccountDto) {
    await this.usersService.deleteAccount(user, deleteAccountDto);
  }
}
