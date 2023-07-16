import { ClassSerializerInterceptor, Controller, Get, HttpStatus, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CurrenciesService } from './currencies.service';
import { CurrencyDto } from './dto/currency.dto';

@ApiTags('currencies')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({
  description: 'Incorrect access token',
})
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all currencies in the system',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CurrencyDto,
    isArray: true,
    description: 'Array of currencies',
  })
  getAll() {
    return this.currenciesService.findAll();
  }
}
