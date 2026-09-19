import { z } from 'zod/v3';

export const customerSchema = z.object({
	fullName: z.string().min(1, 'Name is required'),
	phone: z.string().min(7, 'Enter a valid phone number'),
	email: z.union([z.string().email('Enter a valid email address'), z.literal('')]),
	addressLine: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	zipCode: z.string().optional(),
});

export type CustomerValues = z.infer<typeof customerSchema>;
