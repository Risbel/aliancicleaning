import { useSearchParams } from 'react-router-dom';
import { KpiCards } from '@/components/dashboard/overview/KpiCards';
import { PipelineChart } from '@/components/dashboard/overview/PipelineChart';
import { PlanMixChart } from '@/components/dashboard/overview/PlanMixChart';
import { RevenueChart } from '@/components/dashboard/overview/RevenueChart';
import { UpcomingJobs } from '@/components/dashboard/overview/UpcomingJobs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/auth/use-auth';
import { useStaffProfile } from '@/hooks/queries/use-profile';
import { usePageMeta } from '@/hooks/usePageMeta';
import { DASHBOARD_RANGES, DEFAULT_DASHBOARD_RANGE, type DashboardRange } from '@/lib/dashboard-range';

function parseRange(value: string | null): DashboardRange {
	return DASHBOARD_RANGES.find((option) => option.value === value)?.value ?? DEFAULT_DASHBOARD_RANGE;
}

export default function DashboardHomePage() {
	usePageMeta({
		title: 'Dashboard | Alianci Cleaning Dashboard',
		path: '/dashboard',
		noIndex: true,
	});

	const [searchParams, setSearchParams] = useSearchParams();
	const range = parseRange(searchParams.get('range'));

	const { user } = useAuth();
	const { data: staffProfile } = useStaffProfile(user?.id);
	const isAdmin = staffProfile?.role === 'admin';

	const handleRangeChange = (value: string) => {
		const next = new URLSearchParams(searchParams);
		if (value === DEFAULT_DASHBOARD_RANGE) next.delete('range');
		else next.set('range', value);
		setSearchParams(next, { replace: true });
	};

	return (
		<div className="px-6 py-8 lg:px-12">
			<div className="mx-auto max-w-6xl space-y-6">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold text-foreground">Overview</h1>
						<p className="text-sm text-muted-foreground">
							{isAdmin ? 'Business performance across all quotes' : 'Performance of the quotes assigned to you'}
						</p>
					</div>
					<Select value={range} onValueChange={handleRangeChange}>
						<SelectTrigger className="w-40" aria-label="Date range">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{DASHBOARD_RANGES.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<KpiCards range={range} isAdmin={isAdmin} />
				<div className="grid gap-6 lg:grid-cols-3">
					<div className="lg:col-span-2">
						<RevenueChart range={range} />
					</div>
					<UpcomingJobs />
				</div>
				<div className="grid gap-6 lg:grid-cols-2">
					<PipelineChart />
					<PlanMixChart range={range} />
				</div>
			</div>
		</div>
	);
}
