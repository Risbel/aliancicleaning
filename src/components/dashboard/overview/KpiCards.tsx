import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDownRight01Icon, ArrowUpRight01Icon, MinusSignIcon } from '@hugeicons/core-free-icons';
import { StatCard } from '@/components/dashboard/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardKpis } from '@/hooks/queries/use-dashboard';
import { getDashboardRange, type DashboardRange } from '@/lib/dashboard-range';
import { formatCompactCurrency, formatCompactNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

type Change = { value: number; unit: '%' | ' pts' } | null;

function getPercentChange(current: number, previous: number): Change {
	if (previous === 0) return current === 0 ? { value: 0, unit: '%' } : null;
	return { value: Math.round(((current - previous) / previous) * 100), unit: '%' };
}

function getRate(converted: number, requests: number) {
	return requests > 0 ? converted / requests : null;
}

function Delta({ change, comparisonLabel }: { change: Change; comparisonLabel: string }) {
	if (!change) return <span>No data for the previous period</span>;

	const icon = change.value > 0 ? ArrowUpRight01Icon : change.value < 0 ? ArrowDownRight01Icon : MinusSignIcon;
	const iconClassName =
		change.value > 0 ? 'text-mint-leaf' : change.value < 0 ? 'text-destructive' : 'text-muted-foreground';

	return (
		<span className="inline-flex items-center gap-1">
			<HugeiconsIcon icon={icon} className={cn('size-3.5', iconClassName)} />
			<span className="font-medium text-foreground">
				{change.value > 0 ? '+' : ''}
				{change.value}
				{change.unit}
			</span>
			<span>{comparisonLabel}</span>
		</span>
	);
}

export function KpiCards({ range, isAdmin }: { range: DashboardRange; isAdmin: boolean }) {
	const { data: kpis, isLoading, isError } = useDashboardKpis(range);
	const { comparisonLabel } = getDashboardRange(range);

	if (isLoading) {
		return (
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<Skeleton key={index} className="h-27 rounded-2xl" />
				))}
			</div>
		);
	}

	if (isError || !kpis) return <p className="text-sm text-destructive">Failed to load metrics.</p>;

	const rate = getRate(kpis.converted, kpis.requests);
	const prevRate = getRate(kpis.prev_converted, kpis.prev_requests);
	const rateChange: Change =
		rate !== null && prevRate !== null ? { value: Math.round((rate - prevRate) * 100), unit: ' pts' } : null;

	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			<StatCard
				label="Revenue"
				value={formatCompactCurrency(kpis.revenue)}
				hint={<Delta change={getPercentChange(kpis.revenue, kpis.prev_revenue)} comparisonLabel={comparisonLabel} />}
			/>
			<StatCard
				label="Quote requests"
				value={formatCompactNumber(kpis.requests)}
				hint={<Delta change={getPercentChange(kpis.requests, kpis.prev_requests)} comparisonLabel={comparisonLabel} />}
			/>
			<StatCard
				label="Conversion rate"
				value={rate === null ? '-' : `${Math.round(rate * 100)}%`}
				hint={<Delta change={rateChange} comparisonLabel={comparisonLabel} />}
			/>
			<Link
				to="/dashboard/quotes?status=pending"
				className="rounded-2xl outline-none transition-shadow hover:ring-2 hover:ring-ring/30 focus-visible:ring-2 focus-visible:ring-ring"
			>
				<StatCard
					label="Awaiting review"
					value={formatCompactNumber(kpis.pending_open)}
					hint={
						isAdmin
							? `${kpis.unassigned} open ${kpis.unassigned === 1 ? 'quote' : 'quotes'} unassigned`
							: 'Pending quotes with an upcoming date'
					}
					className="h-full"
				/>
			</Link>
		</div>
	);
}
