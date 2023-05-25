import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { ApiPaginatedResponse } from '../shared/ApiPaginatedResponse.decorator';
import { Transaction } from './transaction.entity';
import { UserGroupGuard } from '../auth/userGroup.guard';
import { TokenPayload } from '../auth/tokenPayload.decorator';
import { AccessTokenPayload } from '../auth/types';
import { PageOptionsDto } from '../shared/dto/PageOptions.dto';

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
  getAll(@TokenPayload() { groupId }: AccessTokenPayload, @Query() pageOptionsDto: PageOptionsDto) {
    return this.transactionsService.getAll(groupId, pageOptionsDto);
  }
}
