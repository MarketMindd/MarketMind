import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { z, ZodAny } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodAny) {}

  transform(value: any) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: z.treeifyError(result.error),
      });
    }

    return result.data;
  }
}
