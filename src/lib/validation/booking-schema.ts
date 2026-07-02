import { z } from 'zod/v3';

export const TIME_PREFERENCES = ['morning', 'afternoon', 'evening'] as const;
export type TimePreference = (typeof TIME_PREFERENCES)[number];

export const TIME_PREFERENCE_HOURS: Record<TimePreference, number> = {
	morning: 9,
	afternoon: 13,
	evening: 17,
};

export const TIME_SLOT_HOURS: Record<TimePreference, number[]> = {
	morning: [8, 9, 10, 11],
	afternoon: [12, 13, 14, 15, 16, 17],
	evening: [18, 19, 20],
};

export const bookingSchema = z.object({
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
	fullName: z.string().min(1, 'Name is required'),
	email: z.string().email('Enter a valid email address'),
	phone: z.string().min(7, 'Enter a valid phone number'),
});

export type BookingValues = z.infer<typeof bookingSchema>;

export const bookingStepFields = {
	1: ['planId', 'bedrooms', 'bathrooms', 'squareFootage', 'hasPets'],
	2: ['addressLine', 'city', 'state', 'zipCode', 'desiredDate', 'timePreference', 'visitHour'],
	3: ['fullName', 'email', 'phone'],
} satisfies Record<number, (keyof BookingValues)[]>;

export const TOTAL_BOOKING_STEPS = Object.keys(bookingStepFields).length;
