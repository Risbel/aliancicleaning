import { z } from 'zod/v3';

export const CUSTOM_PLAN_TYPE = 'other';

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

export const TIME_PREFERENCE_LABELS: Record<TimePreference, string> = {
	morning: 'Morning',
	afternoon: 'Afternoon',
	evening: 'Evening',
};

export function getTimePreferenceForHour(hour: number): TimePreference {
	return TIME_PREFERENCES.find((preference) => TIME_SLOT_HOURS[preference].includes(hour)) ?? 'morning';
}

export const MIN_SERVICE_DESCRIPTION_LENGTH = 20;

export const bookingSchema = z
	.object({
		planId: z.string().min(1, 'Select a cleaning plan'),
		isCustom: z.boolean(),
		serviceDescription: z.string().optional(),
		bedrooms: z.coerce.number().int('Must be a whole number').min(0, 'Must be 0 or more').optional(),
		bathrooms: z.coerce.number().min(0, 'Must be 0 or more').optional(),
		squareFootage: z.coerce.number().int('Must be a whole number').positive('Must be greater than 0').optional(),
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
		customer_note: z.string().optional(),
	})
	.superRefine((values, ctx) => {
		if (values.isCustom) {
			if ((values.serviceDescription?.trim().length ?? 0) < MIN_SERVICE_DESCRIPTION_LENGTH) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['serviceDescription'],
					message: `Tell us a bit more about what you need (at least ${MIN_SERVICE_DESCRIPTION_LENGTH} characters)`,
				});
			}
			return;
		}

		if (values.bedrooms == null) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bedrooms'], message: 'Bedrooms is required' });
		}
		if (values.bathrooms == null) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bathrooms'], message: 'Bathrooms is required' });
		}
		if (values.squareFootage == null) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['squareFootage'], message: 'Square footage is required' });
		}
	});

export type BookingValues = z.infer<typeof bookingSchema>;

const BOOKING_STEP_FIELDS = {
	1: ['planId', 'bedrooms', 'bathrooms', 'squareFootage', 'hasPets'],
	2: ['addressLine', 'city', 'state', 'zipCode', 'desiredDate', 'timePreference', 'visitHour'],
	3: ['fullName', 'email', 'phone'],
} satisfies Record<number, (keyof BookingValues)[]>;

const CUSTOM_FIRST_STEP_FIELDS = ['planId', 'serviceDescription'] satisfies (keyof BookingValues)[];

export function getBookingStepFields(step: number, isCustom: boolean): (keyof BookingValues)[] {
	if (isCustom && step === 1) return [...CUSTOM_FIRST_STEP_FIELDS];
	return [...(BOOKING_STEP_FIELDS[step as keyof typeof BOOKING_STEP_FIELDS] ?? [])];
}

export const TOTAL_BOOKING_STEPS = Object.keys(BOOKING_STEP_FIELDS).length;
