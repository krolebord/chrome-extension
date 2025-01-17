import { z } from 'zod';

export function filteredArraySchema<T extends z.ZodTypeAny>(schema: T) {
  return z
    .array(z.any() as unknown as T)
    .transform((value) => value.filter((item) => schema.safeParse(item).success));
}
