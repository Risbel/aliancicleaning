import { Label, Pie, PieChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardPlanMix } from '@/hooks/queries/use-dashboard';
import { getDashboardRange, type DashboardRange } from '@/lib/dashboard-range';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

const SLOT_COLORS = [
	{ light: '#156390', dark: '#4190d4', swatch: 'bg-[#156390] dark:bg-[#4190d4]' },
	{ light: '#2e8b5e', dark: '#2d9870', swatch: 'bg-[#2e8b5e] dark:bg-[#2d9870]' },
	{ light: '#b07a1e', dark: '#b48d2c', swatch: 'bg-[#b07a1e] dark:bg-[#b48d2c]' },
];

const OTHER_COLOR = { light: '#8a9ba8', dark: '#5a6f7e', swatch: 'bg-[#8a9ba8] dark:bg-[#5a6f7e]' };

type Slice = {
	key: string;
	name: string;
	quotes: number;
	revenue: number;
	fill: string;
	swatch: string;
};

export function PlanMixChart({ range }: { range: DashboardRange }) {
	const { data, isLoading, isError, isPlaceholderData } = useDashboardPlanMix(range);
	const { label } = getDashboardRange(range);

	const plans = [...(data ?? [])].sort((a, b) => a.plan_name.localeCompare(b.plan_name));
	const named = plans.slice(0, SLOT_COLORS.length);
	const rest = plans.slice(SLOT_COLORS.length);

	const slices: Slice[] = named.map((plan, index) => ({
		key: `slot-${index + 1}`,
		name: plan.plan_name,
		quotes: plan.quotes,
		revenue: plan.revenue,
		fill: `var(--color-slot-${index + 1})`,
		swatch: SLOT_COLORS[index].swatch,
	}));
	if (rest.length) {
		slices.push({
			key: 'other',
			name: 'Other',
			quotes: rest.reduce((sum, plan) => sum + plan.quotes, 0),
			revenue: rest.reduce((sum, plan) => sum + plan.revenue, 0),
			fill: 'var(--color-other)',
			swatch: OTHER_COLOR.swatch,
		});
	}

	const chartConfig: ChartConfig = Object.fromEntries([
		...named.map((plan, index) => [
			`slot-${index + 1}`,
			{ label: plan.plan_name, theme: { light: SLOT_COLORS[index].light, dark: SLOT_COLORS[index].dark } },
		]),
		['other', { label: 'Other', theme: { light: OTHER_COLOR.light, dark: OTHER_COLOR.dark } }],
	]);

	const total = slices.reduce((sum, slice) => sum + slice.quotes, 0);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Plan mix</CardTitle>
				<CardDescription>Quote requests by cleaning plan, {label.toLowerCase()}</CardDescription>
			</CardHeader>
			<CardContent>
				{isLoading && <Skeleton className="h-56 w-full rounded-xl" />}
				{isError && <p className="text-sm text-destructive">Failed to load plan mix.</p>}
				{data && total === 0 && (
					<p className="flex h-56 items-center justify-center text-sm text-muted-foreground">
						No quote requests in this period
					</p>
				)}
				{data && total > 0 && (
					<div
						className={cn(
							'flex flex-col items-center gap-6 transition-opacity sm:flex-row',
							isPlaceholderData && 'opacity-60',
						)}
					>
						<ChartContainer config={chartConfig} className="aspect-square h-48 shrink-0">
							<PieChart>
								<ChartTooltip
									cursor={false}
									content={
										<ChartTooltipContent
											hideLabel
											formatter={(_value, _name, item) => {
												const slice = item.payload as Slice;
												return (
													<div className="grid w-full gap-1.5">
														<div className="flex items-center gap-2 font-medium">
															<span className={cn('size-2.5 shrink-0 rounded-[2px]', slice.swatch)} />
															{slice.name}
														</div>
														<div className="flex justify-between gap-4 pl-4.5">
															<span className="text-muted-foreground">Quotes</span>
															<span className="font-medium text-foreground tabular-nums">{slice.quotes}</span>
														</div>
														<div className="flex justify-between gap-4 pl-4.5">
															<span className="text-muted-foreground">Completed revenue</span>
															<span className="font-medium text-foreground tabular-nums">
																{formatCurrency(slice.revenue)}
															</span>
														</div>
													</div>
												);
											}}
										/>
									}
								/>
								<Pie
									data={slices}
									dataKey="quotes"
									nameKey="key"
									innerRadius="62%"
									strokeWidth={2}
									stroke="var(--card)"
									paddingAngle={0}
								>
									<Label
										content={({ viewBox }) => {
											if (!viewBox || !('cx' in viewBox)) return null;
											return (
												<text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
													<tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
														{total}
													</tspan>
													<tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 20} className="fill-muted-foreground text-xs">
														{total === 1 ? 'quote' : 'quotes'}
													</tspan>
												</text>
											);
										}}
									/>
								</Pie>
							</PieChart>
						</ChartContainer>

						<ul className="grid w-full gap-3">
							{slices.map((slice) => (
								<li key={slice.key} className="flex items-center gap-3 text-sm">
									<span className={cn('size-2.5 shrink-0 rounded-[2px]', slice.swatch)} />
									<span className="flex-1 text-foreground">{slice.name}</span>
									<span className="font-medium text-foreground tabular-nums">{slice.quotes}</span>
									<span className="w-10 text-right text-muted-foreground tabular-nums">
										{Math.round((slice.quotes / total) * 100)}%
									</span>
								</li>
							))}
						</ul>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
