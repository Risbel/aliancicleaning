import { format } from 'date-fns';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon } from '@hugeicons/core-free-icons';
import { DayColumn, TimeGutter } from '@/components/dashboard/quotes/calendar/CalendarGrid';
import type { QuoteActions } from '@/components/dashboard/quotes/QuoteRowActions';
import type { QuoteEvent } from '@/components/dashboard/quotes/calendar/QuotesCalendar';
import {
	getConflictingEventIds,
	getConflicts,
	getDayTotals,
	getEventsForDay,
	getFreeGaps,
	type TimeRange,
} from '@/lib/calendar';
import { formatDurationMinutes } from '@/lib/quote-duration';
import { cn } from '@/lib/utils';

function formatRange(range: TimeRange) {
	return `${format(range.start, 'h:mm a')} - ${format(range.end, 'h:mm a')}`;
}

export function DayView({
	anchor,
	events,
	actions,
	staffNames,
	onSelectQuote,
}: {
	anchor: Date;
	events: QuoteEvent[];
	actions: QuoteActions;
	staffNames: Map<string, string>;
	onSelectQuote: (quote: QuoteEvent['quote']) => void;
}) {
	const dayEvents = getEventsForDay(events, anchor);
	const conflictIds = getConflictingEventIds(dayEvents);
	const conflicts = getConflicts(dayEvents);
	const totals = getDayTotals(dayEvents, anchor);
	const gaps = getFreeGaps(dayEvents, anchor);

	return (
		<div className="flex flex-col gap-4 [--slot-h:4rem] lg:flex-row lg:items-start">
			<div className="flex-1 overflow-hidden rounded-lg border border-input">
				<div className="grid grid-cols-[3.5rem_1fr] pt-2">
					<TimeGutter />
					<DayColumn
						day={anchor}
						events={dayEvents}
						conflictIds={conflictIds}
						density="full"
						actions={actions}
						staffNames={staffNames}
						onSelect={onSelectQuote}
					/>
				</div>
			</div>

			<aside className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-4 lg:w-72">
				<div className="rounded-lg border border-input bg-card p-4">
					<h2 className="mb-3 text-sm font-semibold text-foreground">Availability</h2>

					<div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
						<div
							className={cn('h-full rounded-full', totals.load > 0.85 ? 'bg-destructive' : 'bg-primary')}
							style={{ width: `${Math.round(totals.load * 100)}%` }}
						/>
					</div>

					<dl className="grid grid-cols-3 gap-2 text-center">
						<div>
							<dt className="text-[11px] text-muted-foreground uppercase">Booked</dt>
							<dd className="text-sm font-semibold tabular-nums">{formatDurationMinutes(totals.busyMinutes)}</dd>
						</div>
						<div>
							<dt className="text-[11px] text-muted-foreground uppercase">Free</dt>
							<dd className="text-sm font-semibold tabular-nums">{formatDurationMinutes(totals.freeMinutes)}</dd>
						</div>
						<div>
							<dt className="text-[11px] text-muted-foreground uppercase">Jobs</dt>
							<dd className="text-sm font-semibold tabular-nums">{totals.jobCount}</dd>
						</div>
					</dl>
				</div>

				{conflicts.length > 0 && (
					<div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4">
						<h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
							<HugeiconsIcon icon={Alert02Icon} className="size-4 text-destructive" />
							{conflicts.length} {conflicts.length === 1 ? 'conflict' : 'conflicts'}
						</h2>
						<ul className="flex flex-col gap-2 text-xs text-muted-foreground">
							{conflicts.map(({ a, b }) => (
								<li key={`${a.id}-${b.id}`}>
									<span className="font-medium text-foreground">{a.quote.customer_name}</span> and{' '}
									<span className="font-medium text-foreground">{b.quote.customer_name}</span> overlap for the same
									staff member.
								</li>
							))}
						</ul>
					</div>
				)}

				<div className="rounded-lg border border-input bg-card p-4">
					<h2 className="mb-2 text-sm font-semibold text-foreground">Open slots</h2>
					{gaps.length === 0 ? (
						<p className="text-xs text-muted-foreground">No free slots left on this day.</p>
					) : (
						<ul className="flex flex-col gap-1.5">
							{gaps.map((gap) => {
								const minutes = Math.round((gap.end.getTime() - gap.start.getTime()) / 60000);

								return (
									<li
										key={gap.start.toISOString()}
										className={cn(
											'flex items-center justify-between rounded-md px-2 py-1.5 text-xs tabular-nums',
											minutes >= 120 ? 'bg-accent/15 font-medium text-foreground' : 'text-muted-foreground',
										)}
									>
										<span>{formatRange(gap)}</span>
										<span>{formatDurationMinutes(minutes)}</span>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			</aside>
		</div>
	);
}
