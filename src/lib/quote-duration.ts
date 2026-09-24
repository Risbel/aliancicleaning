import { addMinutes, format } from 'date-fns';
import type { Database, Tables } from '@/types/supabase';

type CleaningType = Database['public']['Enums']['cleaning_type'];

export const DEFAULT_QUOTE_DURATION_MINUTES = 120;
export const MIN_QUOTE_DURATION_MINUTES = 30;
export const MAX_QUOTE_DURATION_MINUTES = 720;
export const QUOTE_DURATION_STEP_MINUTES = 30;

const BASE_MINUTES: Record<CleaningType, number> = {
	standard: 60,
	deep: 120,
	move_in_out: 120,
	other: DEFAULT_QUOTE_DURATION_MINUTES,
};

const MINUTES_PER_BEDROOM: Record<CleaningType, number> = {
	standard: 15,
	deep: 25,
	move_in_out: 30,
	other: 0,
};

const MINUTES_PER_BATHROOM: Record<CleaningType, number> = {
	standard: 20,
	deep: 30,
	move_in_out: 35,
	other: 0,
};

const MINUTES_PER_SQFT: Record<CleaningType, number> = {
	standard: 0.02,
	deep: 0.035,
	move_in_out: 0.04,
	other: 0,
};

export type QuoteDurationFields = Pick<
	Tables<'quotes'>,
	'bedrooms' | 'bathrooms' | 'square_footage' | 'duration_minutes'
>;

function snapToStep(minutes: number) {
	const snapped = Math.round(minutes / QUOTE_DURATION_STEP_MINUTES) * QUOTE_DURATION_STEP_MINUTES;
	return Math.min(MAX_QUOTE_DURATION_MINUTES, Math.max(MIN_QUOTE_DURATION_MINUTES, snapped));
}

export function estimateQuoteDurationMinutes(
	quote: Pick<QuoteDurationFields, 'bedrooms' | 'bathrooms' | 'square_footage'>,
	planType: CleaningType | null | undefined,
) {
	const type = planType ?? 'other';
	const minutes =
		BASE_MINUTES[type] +
		(quote.bedrooms ?? 0) * MINUTES_PER_BEDROOM[type] +
		(quote.bathrooms ?? 0) * MINUTES_PER_BATHROOM[type] +
		(quote.square_footage ?? 0) * MINUTES_PER_SQFT[type];

	return snapToStep(minutes);
}

export function getQuoteDurationMinutes(quote: QuoteDurationFields, planType: CleaningType | null | undefined) {
	return quote.duration_minutes ?? estimateQuoteDurationMinutes(quote, planType);
}

export function hasCustomQuoteDuration(quote: Pick<QuoteDurationFields, 'duration_minutes'>) {
	return quote.duration_minutes != null;
}

export function getQuoteTimeRange(
	quote: QuoteDurationFields & Pick<Tables<'quotes'>, 'desired_visit_date'>,
	planType: CleaningType | null | undefined,
) {
	const start = new Date(quote.desired_visit_date);
	return { start, end: addMinutes(start, getQuoteDurationMinutes(quote, planType)) };
}

export function formatQuoteVisitRange(
	quote: QuoteDurationFields & Pick<Tables<'quotes'>, 'desired_visit_date'>,
	planType: CleaningType | null | undefined,
) {
	const { start, end } = getQuoteTimeRange(quote, planType);
	const duration = formatDurationMinutes(getQuoteDurationMinutes(quote, planType));
	return `${format(start, 'M/d/yyyy h:mm a')} - ${format(end, 'h:mm a')} (${duration})`;
}

export function formatDurationMinutes(minutes: number) {
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	if (!hours) return `${rest}m`;
	if (!rest) return `${hours}h`;
	return `${hours}h ${rest}m`;
}

export const QUOTE_DURATION_OPTIONS = Array.from(
	{ length: MAX_QUOTE_DURATION_MINUTES / QUOTE_DURATION_STEP_MINUTES },
	(_, index) => (index + 1) * QUOTE_DURATION_STEP_MINUTES,
);
