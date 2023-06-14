import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'Either', async: true })
export class EitherConstraint implements ValidatorConstraintInterface {
  async validate(value: unknown | null, args: ValidationArguments): Promise<boolean> {
    const [otherFieldName] = args.constraints;

    const otherFieldValue = (args.object as Record<string, unknown>)[otherFieldName];
    return Boolean(value || otherFieldValue);
  }

  defaultMessage(args: ValidationArguments) {
    const otherFieldName = args.constraints[0];
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
