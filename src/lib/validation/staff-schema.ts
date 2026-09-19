import { z } from 'zod/v3';

export const staffLookupSchema = z.object({
	email: z.string().trim().email('Enter a valid email address'),
});

export type StaffLookupValues = z.infer<typeof staffLookupSchema>;
