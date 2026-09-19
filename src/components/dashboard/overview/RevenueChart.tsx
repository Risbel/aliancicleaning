import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardRevenueSeries } from '@/hooks/queries/use-dashboard';
import { getDashboardRange, type DashboardBucket, type DashboardRange } from '@/lib/dashboard-range';
import { formatCompactCurrency, formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { DashboardRevenuePoint } from '@/services/dashboard';

const chartConfig = {
	revenue: { label: 'Revenue', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const TICK_FORMAT: Record<DashboardBucket, string> = {
	day: 'MMM d',
	week: 'MMM d',
	month: 'MMM',
};

function formatBucketLabel(bucket: string, size: DashboardBucket) {
	const date = parseISO(bucket);
	if (size === 'month') return format(date, 'MMMM yyyy');
	if (size === 'week') return `Week of ${format(date, 'MMM d, yyyy')}`;
	return format(date, 'EEE, MMM d, yyyy');
}

export function RevenueChart({ range }: { range: DashboardRange }) {
	const { data, isLoading, isError, isPlaceholderData } = useDashboardRevenueSeries(range);
	const { label } = getDashboardRange(range);
	const points = data?.points ?? [];
	const bucket = data?.bucket ?? 'day';
	const hasRevenue = points.some((point) => point.revenue > 0);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Revenue</CardTitle>
				<CardDescription>Completed jobs by visit date, {label.toLowerCase()}</CardDescription>
			</CardHeader>
			<CardContent>
				{isLoading && <Skeleton className="h-64 w-full rounded-xl" />}
				{isError && <p className="text-sm text-destructive">Failed to load revenue.</p>}
				{data && (
					<div className={cn('relative transition-opacity', isPlaceholderData && 'opacity-60')}>
						<ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
							<AreaChart data={points} margin={{ left: 0, right: 8, top: 8 }}>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="bucket"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									minTickGap={24}
									tickFormatter={(value: string) => format(parseISO(value), TICK_FORMAT[bucket])}
								/>
								<YAxis
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									width={56}
									allowDecimals={false}
									tickFormatter={(value: number) => formatCompactCurrency(value)}
								/>
								<ChartTooltip
									cursor={{ strokeWidth: 1 }}
									content={
										<ChartTooltipContent
											className="min-w-44"
											labelFormatter={(_, payload) => {
												const point = payload?.[0]?.payload as DashboardRevenuePoint | undefined;
												return point ? formatBucketLabel(point.bucket, bucket) : null;
											}}
											formatter={(value, _name, item) => {
												const point = item.payload as DashboardRevenuePoint;
												return (
													<div className="grid w-full gap-1.5">
														<div className="flex items-center gap-2">
															<span className="size-2.5 shrink-0 rounded-[2px] bg-(--color-revenue)" />
															<span className="flex-1 text-muted-foreground">Revenue</span>
															<span className="font-medium text-foreground tabular-nums">
																{formatCurrency(Number(value))}
															</span>
														</div>
														<div className="flex items-center gap-2 pl-4.5">
															<span className="flex-1 text-muted-foreground">Completed jobs</span>
															<span className="font-medium text-foreground tabular-nums">{point.jobs}</span>
														</div>
													</div>
												);
											}}
										/>
									}
								/>
								<Area
									dataKey="revenue"
									type="monotone"
									stroke="var(--color-revenue)"
									strokeWidth={2}
									fill="var(--color-revenue)"
									fillOpacity={0.1}
									activeDot={{ r: 4, strokeWidth: 2 }}
								/>
							</AreaChart>
						</ChartContainer>
						{!hasRevenue && (
							<p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
								No completed jobs in this period
							</p>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
