import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { User } from './user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserGuard } from '../auth/user.guard';
import { CurrentUser } from '../auth/currentUser.decorator';
import { EditProfileDto } from './dto/editProfile.dto';
import { FileRemovalFilter } from './fileRemoval.filter';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(UserGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get current user information',
    description: 'Returns current user information based on access token',
  })
  @ApiResponse({
    status: 200,
    type: User,
    description: 'Returns logged in `User`',
  })
  @ApiUnauthorizedResponse({
    description: 'Incorrect access token',
  })
  async me(@CurrentUser() user: User) {
    return user;
  }

  @Patch('profile')
  @UseGuards(UserGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @UseFilters(FileRemovalFilter)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Edit current user profile',
  })
  @ApiResponse({
    status: 200,
    type: User,
    description: 'Returns updated `User`',
  })
  @ApiUnauthorizedResponse({
    description: 'Incorrect access token',
  })
  async editProfile(
    @CurrentUser() user: User,
    @UploadedFile() avatar: Express.Multer.File,
    @Body() body: EditProfileDto,
  ) {
    return this.usersService.editProfile(user, body, avatar);
  }
}
