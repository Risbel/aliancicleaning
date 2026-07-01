import { z } from 'zod/v3';

export const loginSchema = z.object({
	email: z.string().email('Enter a valid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z
	.object({
		email: z.string().email('Enter a valid email address'),
		password: z.string().min(6, 'Password must be at least 6 characters'),
		confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export type SignupValues = z.infer<typeof signupSchema>;
