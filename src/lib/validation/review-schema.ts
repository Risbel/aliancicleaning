import { z } from 'zod/v3';

export const reviewSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	info: z.string().optional(),
	avatarUrl: z.union([z.string().url('Enter a valid image URL'), z.literal('')]),
	rating: z.enum(['1', '2', '3', '4', '5']),
	quote: z.string().min(1, 'Review text is required'),
	reviewUrl: z.union([z.string().url('Enter a valid URL'), z.literal('')]),
	reviewedAt: z.string().optional(),
	sortOrder: z.string().refine((value) => value === '' || Number.isInteger(Number(value)), 'Enter a whole number'),
	isPublished: z.boolean(),
});

export type ReviewValues = z.infer<typeof reviewSchema>;
