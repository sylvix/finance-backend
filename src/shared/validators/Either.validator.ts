import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'Either', async: true })
export class EitherConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const [otherFieldName] = args.constraints as string[];

    const otherFieldValue = (args.object as Record<string, unknown>)[otherFieldName];
    return Boolean(value || otherFieldValue);
  }

  defaultMessage(args: ValidationArguments) {
    const otherFieldName = args.constraints[0] as string;
    return `Either ${args.property} or ${otherFieldName} should not be empty`;
  }
}

export function Either(otherFieldName: string, validationOptions?: ValidationOptions) {
  return function (object: { constructor: CallableFunction }, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [otherFieldName],
      validator: EitherConstraint,
    });
  };
}
