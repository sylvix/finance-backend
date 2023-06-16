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
import { UserGroupGuard } from '../auth/userGroup.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { Account } from './account.entity';
import { TokenPayload } from '../auth/tokenPayload.decorator';
import { AccessTokenPayload } from '../auth/types';
import { MutateAccountDto } from './dto/MutateAccount.dto';
import { Transaction } from '../transactions/transaction.entity';
import { AccountInGroupGuard } from './guards/AccountInGroup.guard';

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
  async findAll(@TokenPayload() { groupId }: AccessTokenPayload) {
    return this.accountsService.findAllForGroup(groupId);
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

  @Patch(':id')
  @UseGuards(AccountInGroupGuard)
  @ApiOperation({
    summary: 'Edit selected account',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Transaction,
    description: 'Account was edited successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'This account does not exist',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Trying to edit account not in User's defaultGroup",
  })
  async edit(@Param('id', ParseIntPipe) id: number, @Body() body: MutateAccountDto) {
    return this.accountsService.edit(id, body);
  }

  @Delete(':id')
  @UseGuards(AccountInGroupGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete selected account',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    type: Transaction,
    description: 'Account was deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'This account does not exist',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Trying to delete account not in User's defaultGroup",
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.accountsService.remove(id);
  }
}
