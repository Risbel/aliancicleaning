import { z } from 'zod/v3';

export const planContentSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string(),
	features: z.array(z.object({ value: z.string().min(1, 'Feature cannot be empty') })),
	ctaLabel: z.string().min(1, 'Button label is required'),
	imageBg: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Enter a hex color like #156390'),
	isPopular: z.boolean(),
	isActive: z.boolean(),
	sortOrder: z.number().int('Enter a whole number').min(0, 'Must be 0 or more'),
});

export type PlanContentValues = z.infer<typeof planContentSchema>;
