import { addDays, isSameDay, startOfWeek } from 'date-fns';
import { DayColumn, DayHeader, TimeGutter } from '@/components/dashboard/quotes/calendar/CalendarGrid';
import type { QuoteActions } from '@/components/dashboard/quotes/QuoteRowActions';
import type { QuoteEvent } from '@/components/dashboard/quotes/calendar/QuotesCalendar';
import { getConflictingEventIds, getDayTotals, getEventsForDay } from '@/lib/calendar';
import { formatDurationMinutes } from '@/lib/quote-duration';
import { cn } from '@/lib/utils';

export function WeekView({
	anchor,
	events,
	actions,
	staffNames,
	onSelectQuote,
	onSelectDay,
	onAnchorChange,
}: {
	anchor: Date;
	events: QuoteEvent[];
	actions: QuoteActions;
	staffNames: Map<string, string>;
	onSelectQuote: (quote: QuoteEvent['quote']) => void;
	onSelectDay: (day: Date) => void;
	onAnchorChange: (day: Date) => void;
}) {
	const weekStart = startOfWeek(anchor);
	const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
	const conflictIds = getConflictingEventIds(events);

	return (
		<div className="[--slot-h:3.5rem]">
			<div className="mb-2 flex gap-1 overflow-x-auto md:hidden">
				{days.map((day) => (
					<button
						key={day.toISOString()}
						type="button"
						onClick={() => onAnchorChange(day)}
						className={cn(
							'flex-1 rounded-md border border-input px-2 py-1.5 text-xs whitespace-nowrap',
							isSameDay(day, anchor) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/60',
						)}
					>
						{day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
					</button>
				))}
			</div>

			<div className="overflow-hidden rounded-lg border border-input">
				<div className="grid grid-cols-[3.5rem_1fr] border-b border-input bg-card md:grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]">
					<div />
					{days.map((day) => {
						const totals = getDayTotals(getEventsForDay(events, day), day);

						return (
							<div
								key={day.toISOString()}
								className={cn(
									'flex flex-col items-center border-l border-input',
									!isSameDay(day, anchor) && 'hidden md:flex',
								)}
							>
								<DayHeader day={day} onSelect={onSelectDay} />
								<span className="pb-1 text-[10px] tabular-nums text-muted-foreground">
									{totals.jobCount > 0 ? `${formatDurationMinutes(totals.busyMinutes)} booked` : 'Free'}
								</span>
							</div>
						);
					})}
				</div>

				<div className="grid grid-cols-[3.5rem_1fr] pt-2 md:grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]">
					<TimeGutter />
					{days.map((day) => (
						<DayColumn
							key={day.toISOString()}
							day={day}
							events={events}
							conflictIds={conflictIds}
							density="compact"
							actions={actions}
							staffNames={staffNames}
							onSelect={onSelectQuote}
							className={cn(!isSameDay(day, anchor) && 'hidden md:block')}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
