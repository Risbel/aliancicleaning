import { Link } from 'react-router-dom';
import { differenceInCalendarDays, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardUpcomingJobs } from '@/hooks/queries/use-dashboard';
import { formatCurrency } from '@/lib/format';

function formatRelativeDay(date: Date) {
	const days = differenceInCalendarDays(date, new Date());
	if (days <= 0) return 'Today';
	if (days === 1) return 'Tomorrow';
	return `In ${days} days`;
}

export function UpcomingJobs() {
	const { data: jobs, isLoading, isError } = useDashboardUpcomingJobs();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Upcoming jobs</CardTitle>
				<CardDescription>Next accepted visits on the calendar</CardDescription>
				<CardAction>
					<Button variant="ghost" size="sm" asChild>
						<Link to="/dashboard/quotes?status=accepted">View all</Link>
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				{isLoading && (
					<div className="grid gap-3">
						{Array.from({ length: 3 }).map((_, index) => (
							<Skeleton key={index} className="h-12 w-full rounded-xl" />
						))}
					</div>
				)}
				{isError && <p className="text-sm text-destructive">Failed to load upcoming jobs.</p>}
				{jobs && jobs.length === 0 && (
					<p className="py-6 text-center text-sm text-muted-foreground">No accepted visits coming up</p>
				)}
				{jobs && jobs.length > 0 && (
					<ul className="divide-y divide-border">
						{jobs.map((job) => {
							const date = new Date(job.desired_visit_date);
							return (
								<li key={job.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
									<div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-muted py-1.5 text-foreground">
										<span className="text-[10px] font-medium uppercase">{format(date, 'MMM')}</span>
										<span className="text-lg leading-none font-bold">{format(date, 'd')}</span>
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-foreground">{job.customer_name}</p>
										<p className="truncate text-xs text-muted-foreground">
											{formatRelativeDay(date)}
											{job.city ? ` · ${job.city}` : ''}
										</p>
									</div>
									<span className="text-sm font-medium text-foreground tabular-nums">
										{job.price != null ? formatCurrency(job.price) : '-'}
									</span>
								</li>
							);
						})}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}
