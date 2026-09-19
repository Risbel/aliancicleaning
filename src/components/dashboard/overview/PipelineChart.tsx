import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardPipeline } from '@/hooks/queries/use-dashboard';
import { QUOTE_FILTER_TAGS } from '@/lib/quote-status';

const chartConfig = {
	total: { label: 'Quotes', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const STAGE_HINT: Record<string, string> = {
	pending: 'Waiting for a first look',
	reviewed: 'Looked at, no price sent yet',
	quoted: 'Price sent, waiting on the client',
	accepted: 'Booked, visit coming up',
	expired: 'Pending past the requested date',
};

function getStageLabel(status: string) {
	return QUOTE_FILTER_TAGS.find((tag) => tag.value === status)?.label ?? status;
}

export function PipelineChart() {
	const navigate = useNavigate();
	const { data, isLoading, isError } = useDashboardPipeline();
	const stages = (data ?? []).map((stage) => ({ ...stage, label: getStageLabel(stage.status) }));
	const open = stages.filter((stage) => stage.status !== 'expired').reduce((sum, stage) => sum + stage.total, 0);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Pipeline</CardTitle>
				<CardDescription>
					{data ? `${open} open ${open === 1 ? 'quote' : 'quotes'} right now` : 'Open quotes right now'}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{isLoading && <Skeleton className="h-56 w-full rounded-xl" />}
				{isError && <p className="text-sm text-destructive">Failed to load pipeline.</p>}
				{data && (
					<ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
						<BarChart data={stages} layout="vertical" margin={{ left: 0, right: 32 }} barCategoryGap={8}>
							<YAxis dataKey="label" type="category" tickLine={false} axisLine={false} tickMargin={8} width={72} />
							<XAxis type="number" dataKey="total" hide allowDecimals={false} />
							<ChartTooltip
								cursor={false}
								content={
									<ChartTooltipContent
										hideIndicator
										labelFormatter={(_, payload) => {
											const stage = payload?.[0]?.payload as (typeof stages)[number] | undefined;
											return stage ? (
												<span className="grid gap-0.5">
													<span>{stage.label}</span>
													<span className="font-normal text-muted-foreground">{STAGE_HINT[stage.status]}</span>
												</span>
											) : null;
										}}
									/>
								}
							/>
							<Bar
								dataKey="total"
								radius={4}
								maxBarSize={24}
								className="cursor-pointer"
								onClick={(entry) => {
									const stage = entry.payload as (typeof stages)[number];
									navigate(`/dashboard/quotes?status=${stage.status}`);
								}}
							>
								{stages.map((stage) => (
									<Cell
										key={stage.status}
										fill={stage.status === 'expired' ? 'var(--destructive)' : 'var(--color-total)'}
									/>
								))}
								<LabelList dataKey="total" position="right" offset={8} className="fill-foreground font-medium" />
							</Bar>
						</BarChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
