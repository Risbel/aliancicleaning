import { supabase } from '@/lib/supabase/client';
import type { DashboardPeriod } from '@/lib/dashboard-range';
import type { Database } from '@/types/supabase';

type Functions = Database['public']['Functions'];

export type DashboardKpis = Functions['get_dashboard_kpis']['Returns'][number];
export type DashboardRevenuePoint = Functions['get_dashboard_revenue_series']['Returns'][number];
export type DashboardPipelineStage = Functions['get_dashboard_pipeline']['Returns'][number];
export type DashboardPlanMix = Functions['get_dashboard_plan_mix']['Returns'][number];

export type DashboardUpcomingJob = Omit<
	Functions['get_dashboard_upcoming_jobs']['Returns'][number],
	'city' | 'price'
> & {
	city: string | null;
	price: number | null;
};

export async function getDashboardKpis(period: DashboardPeriod): Promise<DashboardKpis | null> {
	const { data, error } = await supabase.rpc('get_dashboard_kpis', {
		p_from: period.from,
		p_to: period.to,
		p_prev_from: period.prevFrom,
	});

	if (error) throw error;
	return data?.[0] ?? null;
}

export async function getDashboardRevenueSeries(period: DashboardPeriod): Promise<DashboardRevenuePoint[]> {
	const { data, error } = await supabase.rpc('get_dashboard_revenue_series', {
		p_from: period.from,
		p_to: period.to,
		p_bucket: period.bucket,
		p_tz: period.timeZone,
	});

	if (error) throw error;
	return data;
}

export async function getDashboardPipeline(): Promise<DashboardPipelineStage[]> {
	const { data, error } = await supabase.rpc('get_dashboard_pipeline');

	if (error) throw error;
	return data;
}

export async function getDashboardPlanMix(period: DashboardPeriod): Promise<DashboardPlanMix[]> {
	const { data, error } = await supabase.rpc('get_dashboard_plan_mix', {
		p_from: period.from,
		p_to: period.to,
	});

	if (error) throw error;
	return data;
}

export async function getDashboardUpcomingJobs(limit: number): Promise<DashboardUpcomingJob[]> {
	const { data, error } = await supabase.rpc('get_dashboard_upcoming_jobs', { p_limit: limit });

	if (error) throw error;
	return data;
}
