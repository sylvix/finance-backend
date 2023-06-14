import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'NotSame', async: false })
export class NotSameConstraint implements ValidatorConstraintInterface {
  async validate(value: unknown | null, args: ValidationArguments): Promise<boolean> {
    const [otherFieldName] = args.constraints;

    const otherFieldValue = (args.object as Record<string, unknown>)[otherFieldName];
    return value !== otherFieldValue;
  }

  defaultMessage(args: ValidationArguments) {
    const otherFieldName = args.constraints[0];
    return `${args.property} should not be the same as ${otherFieldName}`;
  }
}

export function NotSame(otherFieldName: string, validationOptions?: ValidationOptions) {
  return function (object: { constructor: CallableFunction }, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [otherFieldName],
      validator: NotSameConstraint,
    });
  };
}
