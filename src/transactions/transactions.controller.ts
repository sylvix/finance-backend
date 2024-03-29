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
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { ApiPaginatedResponse } from '../shared/ApiPaginatedResponse.decorator';
import { Transaction } from './transaction.entity';
import { UserGroupGuard } from '../auth/userGroup.guard';
import { TokenPayload } from '../auth/tokenPayload.decorator';
import { AccessTokenPayload } from '../auth/types';
import { MutateTransactionDto } from './dto/MutateTransaction.dto';
import { TransactionInGroupGuard } from './guards/TransactionInGroup.guard';
import { TransactionsFilterOptionsDto } from './dto/TransactionsFilterOptions.dto';

@ApiTags('transactions')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({
  description: 'Incorrect access token',
})
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(UserGroupGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get paginated transactions for the current group',
  })
  @ApiPaginatedResponse(Transaction)
  getAll(@TokenPayload() { groupId }: AccessTokenPayload, @Query() optionsDto: TransactionsFilterOptionsDto) {
    return this.transactionsService.getAll(groupId, optionsDto);
  }

  @Post()
  @ApiOperation({
    summary: 'Create new transaction',
  })
  create(@TokenPayload() { groupId }: AccessTokenPayload, @Body() mutateTransactionDto: MutateTransactionDto) {
    return this.transactionsService.create(groupId, mutateTransactionDto);
  }

  @Patch(':id')
  @UseGuards(TransactionInGroupGuard)
  @ApiOperation({
    summary: 'Edit a transaction',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Transaction,
    description: 'Transaction was edited successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'This transaction does not exist',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Trying to edit transaction not in User's defaultGroup or assign accounts from other groups",
  })
  async edit(@Param('id', ParseIntPipe) id: number, @Body() mutateTransactionDto: MutateTransactionDto) {
    return this.transactionsService.edit(id, mutateTransactionDto);
  }

  @Delete(':id')
  @UseGuards(TransactionInGroupGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a transaction',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Transaction deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transaction not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Trying to delete transaction not in current User's defaultGroup",
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.remove(id);
  }
}
