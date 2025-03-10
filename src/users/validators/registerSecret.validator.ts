import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@ValidatorConstraint({ name: 'RegisterSecret' })
@Injectable()
export class RegisterSecretConstraint implements ValidatorConstraintInterface {
  constructor(private readonly configService: ConfigService) {}

  validate(secret: string) {
    const validSecret = this.configService.get<string>('REGISTER_INVITE_SECRET');

    return secret === validSecret;
  }

  defaultMessage(): string {
    return 'Registration secret invalid';
  }
}

export function RegisterSecret(validationOptions?: ValidationOptions) {
  return function (object: { constructor: CallableFunction }, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: RegisterSecretConstraint,
    });
  };
}
