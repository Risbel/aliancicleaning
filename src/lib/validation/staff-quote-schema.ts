import { z } from 'zod/v3';
import { TIME_PREFERENCES } from '@/lib/validation/booking-schema';

export const staffQuoteSchema = z.object({
	planId: z.string().min(1, 'Select a cleaning plan'),
	bedrooms: z.coerce.number().int('Must be a whole number').min(0, 'Must be 0 or more'),
	bathrooms: z.coerce.number().min(0, 'Must be 0 or more'),
	squareFootage: z.coerce.number().int('Must be a whole number').positive('Must be greater than 0'),
	hasPets: z.boolean(),
	addressLine: z.string().min(1, 'Address is required'),
	city: z.string().optional(),
	state: z.string().optional(),
	zipCode: z.string().optional(),
	desiredDate: z.date({ required_error: 'Select a date' }),
	timePreference: z.enum(TIME_PREFERENCES, { required_error: 'Select a time preference' }),
	visitHour: z.number().int().min(0).max(23).optional(),
	customerPhone: z.string().min(7, 'Enter a valid phone number'),
	finalPrice: z.number().min(0, 'Must be 0 or more').optional(),
	adminNotes: z.string().optional(),
});

export type StaffQuoteValues = z.infer<typeof staffQuoteSchema>;
