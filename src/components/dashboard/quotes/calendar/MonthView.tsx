import { eachDayOfInterval, format, isSameMonth, isToday, subDays } from 'date-fns';
import { QuoteBlock } from '@/components/dashboard/quotes/calendar/QuoteBlock';
import type { QuoteEvent } from '@/components/dashboard/quotes/calendar/QuotesCalendar';
import { getConflictingEventIds, getDayTotals, getEventsForDay, type TimeRange } from '@/lib/calendar';
import { cn } from '@/lib/utils';

const MAX_CHIPS = 3;

export function MonthView({
	anchor,
	range,
	events,
	staffNames,
	onSelectQuote,
	onSelectDay,
}: {
	anchor: Date;
	range: TimeRange;
	events: QuoteEvent[];
	staffNames: Map<string, string>;
	onSelectQuote: (quote: QuoteEvent['quote']) => void;
	onSelectDay: (day: Date) => void;
}) {
	const days = eachDayOfInterval({ start: range.start, end: subDays(range.end, 1) });
	const conflictIds = getConflictingEventIds(events);

	return (
		<div className="overflow-hidden rounded-lg border border-input">
			<div className="grid grid-cols-7 border-b border-input bg-card">
				{days.slice(0, 7).map((day) => (
					<div
						key={day.toISOString()}
						className="py-2 text-center text-[11px] tracking-[0.15em] text-muted-foreground uppercase"
					>
						{format(day, 'EEE')}
					</div>
				))}
			</div>

			<div className="grid grid-cols-7">
				{days.map((day) => {
					const dayEvents = getEventsForDay(events, day);
					const totals = getDayTotals(dayEvents, day);
					const outside = !isSameMonth(day, anchor);
					const hidden = dayEvents.length - MAX_CHIPS;

					return (
						<div
							key={day.toISOString()}
							className={cn(
								'flex min-h-28 flex-col gap-1 border-t border-l border-input p-1.5 first:border-l-0 [&:nth-child(7n+1)]:border-l-0',
								outside && 'bg-muted/30',
							)}
						>
							<div className="flex items-center justify-between gap-1">
								<button
									type="button"
									onClick={() => onSelectDay(day)}
									className={cn(
										'flex size-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums hover:bg-muted',
										isToday(day) && 'bg-primary text-primary-foreground hover:bg-primary',
										outside && !isToday(day) && 'text-muted-foreground',
									)}
								>
									{format(day, 'd')}
								</button>
								{totals.jobCount > 0 && (
									<span className="text-[10px] tabular-nums text-muted-foreground">{totals.jobCount}</span>
								)}
							</div>

							{totals.jobCount > 0 && (
								<div className="h-1 overflow-hidden rounded-full bg-muted">
									<div
										className={cn('h-full rounded-full', totals.load > 0.85 ? 'bg-destructive' : 'bg-primary')}
										style={{ width: `${Math.round(totals.load * 100)}%` }}
									/>
								</div>
							)}

							<div className="flex flex-col gap-0.5">
								{dayEvents.slice(0, MAX_CHIPS).map((event) => (
									<QuoteBlock
										key={event.id}
										event={event}
										density="chip"
										isConflicting={conflictIds.has(event.id)}
										assigneeName={event.assignedTo ? staffNames.get(event.assignedTo) : undefined}
										onSelect={onSelectQuote}
									/>
								))}
							</div>

							{hidden > 0 && (
								<button
									type="button"
									onClick={() => onSelectDay(day)}
									className="mt-auto text-left text-[11px] text-muted-foreground hover:text-foreground hover:underline"
								>
									+{hidden} more
								</button>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
