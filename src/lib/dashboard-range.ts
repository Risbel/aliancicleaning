import { addDays, addMonths, startOfDay, startOfMonth, subDays, subMonths } from 'date-fns';

export type DashboardRange = '7d' | '30d' | '90d' | '12m';
export type DashboardBucket = 'day' | 'week' | 'month';

export type DashboardPeriod = {
	from: string;
	to: string;
	prevFrom: string;
	bucket: DashboardBucket;
	timeZone: string;
};

export const DASHBOARD_RANGES: { value: DashboardRange; label: string; comparisonLabel: string }[] = [
	{ value: '7d', label: 'Last 7 days', comparisonLabel: 'vs previous 7 days' },
	{ value: '30d', label: 'Last 30 days', comparisonLabel: 'vs previous 30 days' },
	{ value: '90d', label: 'Last 90 days', comparisonLabel: 'vs previous 90 days' },
	{ value: '12m', label: 'Last 12 months', comparisonLabel: 'vs previous 12 months' },
];

export const DEFAULT_DASHBOARD_RANGE: DashboardRange = '30d';

const DAY_RANGES: Record<Exclude<DashboardRange, '12m'>, { days: number; bucket: DashboardBucket }> = {
	'7d': { days: 7, bucket: 'day' },
	'30d': { days: 30, bucket: 'day' },
	'90d': { days: 90, bucket: 'week' },
};

export function getDashboardTimeZone() {
	return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getDashboardRange(range: DashboardRange) {
	return DASHBOARD_RANGES.find((option) => option.value === range) ?? DASHBOARD_RANGES[1];
}

export function getDashboardPeriod(range: DashboardRange, now = new Date()): DashboardPeriod {
	const timeZone = getDashboardTimeZone();

	if (range === '12m') {
		const to = startOfMonth(addMonths(now, 1));
		const from = subMonths(to, 12);
		return {
			from: from.toISOString(),
			to: to.toISOString(),
			prevFrom: subMonths(from, 12).toISOString(),
			bucket: 'month',
			timeZone,
		};
	}

	const { days, bucket } = DAY_RANGES[range];
	const to = startOfDay(addDays(now, 1));
	const from = subDays(to, days);
	return {
		from: from.toISOString(),
		to: to.toISOString(),
		prevFrom: subDays(from, days).toISOString(),
		bucket,
		timeZone,
	};
}
