import { z } from 'zod/v3';

export const planPricingSchema = z.object({
	basePrice: z.number().min(0, 'Must be 0 or more'),
	pricePerBedroom: z.number().min(0, 'Must be 0 or more'),
	pricePerBathroom: z.number().min(0, 'Must be 0 or more'),
	pricePerSqft: z.number().min(0, 'Must be 0 or more'),
	petFee: z.number().min(0, 'Must be 0 or more'),
});

export type PlanPricingValues = z.infer<typeof planPricingSchema>;
