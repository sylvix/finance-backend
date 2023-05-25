import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserGroupGuard } from '../auth/userGroup.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { Account } from './account.entity';
import { TokenPayload } from '../auth/tokenPayload.decorator';
import { AccessTokenPayload } from '../auth/types';
import { MutateAccountDto } from './dto/MutateAccount.dto';

@ApiTags('accounts')
@Controller('accounts')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({
  description: 'Incorrect access token',
})
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(UserGroupGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all accounts of current group',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Account,
    isArray: true,
    description: 'Array of `Account`s',
  })
  async getAll(@TokenPayload() { groupId }: AccessTokenPayload) {
    return this.accountsService.getAllForGroup(groupId);
  }

  @Post()
  @ApiOperation({
    summary: 'Create new account for current group',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: Account,
    description: 'Created `Account`',
  })
  async create(@TokenPayload() { groupId }: AccessTokenPayload, @Body() body: MutateAccountDto) {
    return this.accountsService.create(groupId, body);
  }
}
