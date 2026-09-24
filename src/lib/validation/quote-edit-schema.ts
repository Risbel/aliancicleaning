import { z } from 'zod/v3';
import { MAX_QUOTE_DURATION_MINUTES } from '@/lib/quote-duration';
import { TIME_PREFERENCES } from '@/lib/validation/booking-schema';

export const quoteEditSchema = z.object({
	customerPhone: z.string().min(7, 'Enter a valid phone number'),
	finalPrice: z.number().min(0, 'Must be 0 or more').optional(),
	desiredVisitDate: z.date({ required_error: 'Select a date' }),
	timePreference: z.enum(TIME_PREFERENCES, { required_error: 'Select a time preference' }),
	visitHour: z.number().int().min(0).max(23).optional(),
	durationMinutes: z.number().int().positive().max(MAX_QUOTE_DURATION_MINUTES).optional(),
	adminNotes: z.string().optional(),
});

export type QuoteEditValues = z.infer<typeof quoteEditSchema>;
