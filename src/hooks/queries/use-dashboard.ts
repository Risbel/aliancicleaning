import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { dashboardKeys } from '@/lib/query-keys';
import { getDashboardPeriod, getDashboardTimeZone, type DashboardRange } from '@/lib/dashboard-range';
import {
	getDashboardKpis,
	getDashboardPipeline,
	getDashboardPlanMix,
	getDashboardRevenueSeries,
	getDashboardUpcomingJobs,
} from '@/services/dashboard';

export function useDashboardKpis(range: DashboardRange) {
	return useQuery({
		queryKey: dashboardKeys.kpis({ range, timeZone: getDashboardTimeZone() }),
		queryFn: () => getDashboardKpis(getDashboardPeriod(range)),
		placeholderData: keepPreviousData,
	});
}

export function useDashboardRevenueSeries(range: DashboardRange) {
	return useQuery({
		queryKey: dashboardKeys.revenueSeries({ range, timeZone: getDashboardTimeZone() }),
		queryFn: async () => {
			const period = getDashboardPeriod(range);
			return { bucket: period.bucket, points: await getDashboardRevenueSeries(period) };
		},
		placeholderData: keepPreviousData,
	});
}

export function useDashboardPipeline() {
	return useQuery({
		queryKey: dashboardKeys.pipeline(),
		queryFn: () => getDashboardPipeline(),
	});
}

export function useDashboardPlanMix(range: DashboardRange) {
	return useQuery({
		queryKey: dashboardKeys.planMix({ range, timeZone: getDashboardTimeZone() }),
		queryFn: () => getDashboardPlanMix(getDashboardPeriod(range)),
		placeholderData: keepPreviousData,
	});
}

export function useDashboardUpcomingJobs(limit = 5) {
	return useQuery({
		queryKey: dashboardKeys.upcomingJobs(limit),
		queryFn: () => getDashboardUpcomingJobs(limit),
	});
}
