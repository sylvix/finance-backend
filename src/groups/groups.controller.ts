import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TokenPayload } from '../auth/tokenPayload.decorator';
import { AccessTokenPayload } from '../auth/types';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Group } from './group.entity';
import { CreateGroupDto } from './dto/createGroup.dto';
import { InviteToGroupDto } from './dto/inviteToGroup.dto';
import { UserToGroup } from './userToGroup.entity';
import { RevokeFromGroupDto } from './dto/revokeFromGroup.dto';
import { EditGroupDto } from './dto/editGroup.dto';
import { GroupOwnershipTransferDto } from './dto/groupOwnershipTransfer.dto';

@ApiTags('groups')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({
  description: 'Incorrect access token',
})
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all groups of currently logged in user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Group,
    isArray: true,
    description: 'Array of `Group`s',
  })
  async getAll(@TokenPayload() { userId }: AccessTokenPayload) {
    return this.groupsService.getAllForUser(userId);
  }

  @Post()
  @ApiOperation({
    summary: 'Create new group for logged in user',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: Group,
    description: 'Created `Group`',
  })
  async create(@TokenPayload() { userId }: AccessTokenPayload, @Body() body: CreateGroupDto) {
    return this.groupsService.create(userId, body);
  }

  @Post(':id/switch')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Switch default Group for logged in User',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    type: Group,
    description: 'Group was switched',
  })
  async switch(@TokenPayload() { userId }: AccessTokenPayload, @Param('id', ParseIntPipe) groupId: number) {
    await this.groupsService.switch(userId, groupId);
  }

  @Post(':id/invite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Invite selected user by email into a group',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserToGroup,
    description: 'Created `UserToGroup`',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not sufficient rights to invite others to this group',
  })
  async invite(
    @TokenPayload() { userId }: AccessTokenPayload,
    @Param('id', ParseIntPipe) groupId: number,
    @Body() body: InviteToGroupDto,
  ) {
    return this.groupsService.invite(userId, groupId, body.email);
  }

  @Post(':id/revoke')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove selected user from group',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Successfully revoked this user from this group',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'User does not have sufficient rights to revoke user from this group (or tries to revoke itself as owner)',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'This user or group does not exist',
  })
  async revoke(
    @TokenPayload() { userId }: AccessTokenPayload,
    @Param('id', ParseIntPipe) groupId: number,
    @Body() body: RevokeFromGroupDto,
  ) {
    await this.groupsService.revoke(userId, groupId, body.userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Edit group',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Group,
    description: 'Edited `Group`',
  })
  async edit(
    @TokenPayload() { userId }: AccessTokenPayload,
    @Param('id', ParseIntPipe) groupId: number,
    @Body() body: EditGroupDto,
  ) {
    return this.groupsService.edit(userId, groupId, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete group',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The group was deleted successfully',
  })
  async remove(@TokenPayload() { userId }: AccessTokenPayload, @Param('id', ParseIntPipe) groupId: number) {
    await this.groupsService.remove(userId, groupId);
  }

  @Post(':id/transfer-ownership')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Transfer group ownership to another user',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Ownership transferred successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User is not the owner of this group',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'New owner is not a member of this group',
  })
  async transferOwnership(
    @TokenPayload() { userId }: AccessTokenPayload,
    @Param('id', ParseIntPipe) groupId: number,
    @Body() { newOwnerId }: GroupOwnershipTransferDto,
  ) {
    await this.groupsService.transferOwnership(userId, { groupId, newOwnerId });
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Leave group',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Left group successfully',
  })
  async leave(@TokenPayload() { userId }: AccessTokenPayload, @Param('id', ParseIntPipe) groupId: number) {
    await this.groupsService.leave(userId, groupId);
  }
}
