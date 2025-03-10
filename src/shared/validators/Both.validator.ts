import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'Both', async: true })
export class BothConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const [otherFieldName] = args.constraints as string[];

    const exceptFieldValue = (args.object as Record<string, unknown>)[otherFieldName];

    if (value && exceptFieldValue) {
      return true;
    }

    return !value && !exceptFieldValue;
  }

  defaultMessage(args: ValidationArguments) {
    const otherFieldName = args.constraints[0] as string;
    return `Both ${args.property} and ${otherFieldName} should not be empty`;
  }
}

export function Both(otherFieldName: string, validationOptions?: ValidationOptions) {
  return function (object: { constructor: CallableFunction }, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [otherFieldName],
      validator: BothConstraint,
    });
  };
}
