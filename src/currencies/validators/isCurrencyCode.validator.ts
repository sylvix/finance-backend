import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { CurrenciesService } from '../currencies.service';

@ValidatorConstraint({ name: 'RegisterSecret' })
@Injectable()
export class CurrencyConstraint implements ValidatorConstraintInterface {
  constructor(private readonly currenciesService: CurrenciesService) {}

  async validate(code: string) {
    const currencies = await this.currenciesService.getAll();
    const currencyDto = currencies.find((currency) => currency.code === code);

    return Boolean(currencyDto);
  }

  defaultMessage(): string {
    return 'This currency does not exist';
  }
}

export function IsCurrencyCode(validationOptions?: ValidationOptions) {
  return function (object: { constructor: CallableFunction }, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: CurrencyConstraint,
    });
  };
}
