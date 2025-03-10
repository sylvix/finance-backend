import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsPositiveIntOrNull', async: false })
export class IsPositiveIntOrNullConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return (typeof value === 'number' && Number.isInteger(value) && value > 0) || value === null;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} should be a positive integer or null`;
  }
}

export function IsPositiveIntOrNull(validationOptions?: ValidationOptions) {
  return function (object: { constructor: CallableFunction }, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsPositiveIntOrNullConstraint,
    });
  };
}
