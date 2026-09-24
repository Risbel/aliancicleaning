import { format, isToday } from 'date-fns';
import { QuoteBlock } from '@/components/dashboard/quotes/calendar/QuoteBlock';
import type { QuoteActions } from '@/components/dashboard/quotes/QuoteRowActions';
import type { QuoteEvent } from '@/components/dashboard/quotes/calendar/QuotesCalendar';
import {
	DAY_END_HOUR,
	DAY_START_HOUR,
	getEventPosition,
	getEventsForDay,
	getTimeOffset,
	layoutDayEvents,
} from '@/lib/calendar';
import { cn } from '@/lib/utils';

export const GRID_HOURS = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, index) => DAY_START_HOUR + index);

export function formatHour(hour: number) {
	const suffix = hour < 12 ? 'AM' : 'PM';
	const display = hour % 12 === 0 ? 12 : hour % 12;
	return `${display} ${suffix}`;
}

export function TimeGutter() {
	return (
		<div className="flex flex-col">
			{GRID_HOURS.map((hour) => (
				<div
					key={hour}
					className="relative h-(--slot-h) pr-2 text-right text-[11px] tabular-nums text-muted-foreground"
				>
					<span className="absolute -top-1.5 right-2">{formatHour(hour)}</span>
				</div>
			))}
		</div>
	);
}

export function HourRows() {
	return (
		<div className="pointer-events-none">
			{GRID_HOURS.map((hour) => (
				<div key={hour} className="h-(--slot-h) border-b border-input/70 last:border-b-0" />
			))}
		</div>
	);
}

export function NowIndicator({ day }: { day: Date }) {
	if (!isToday(day)) return null;

	const offset = getTimeOffset(new Date(), day);
	if (offset < 0 || offset > 1) return null;

	return (
		<div className="pointer-events-none absolute inset-x-0 z-20" style={{ top: `${offset * 100}%` }}>
			<div className="relative border-t-2 border-destructive">
				<span className="absolute -top-1 -left-1 size-2 rounded-full bg-destructive" />
			</div>
		</div>
	);
}

export function DayColumn({
	day,
	events,
	conflictIds,
	density,
	actions,
	staffNames,
	onSelect,
	className,
}: {
	day: Date;
	events: QuoteEvent[];
	conflictIds: Set<string>;
	density: 'compact' | 'full';
	actions: QuoteActions;
	staffNames: Map<string, string>;
	onSelect: (quote: QuoteEvent['quote']) => void;
	className?: string;
}) {
	const dayEvents = getEventsForDay(events, day);
	const positioned = layoutDayEvents(dayEvents);

	return (
		<div className={cn('relative border-l border-input', className)}>
			<HourRows />
			<NowIndicator day={day} />

			{positioned.map(({ event, column, columns }) => {
				const { top, height, startsBeforeWindow, endsAfterWindow } = getEventPosition(event, day);

				return (
					<QuoteBlock
						key={event.id}
						event={event}
						density={density}
						isConflicting={conflictIds.has(event.id)}
						actions={actions}
						assigneeName={event.assignedTo ? staffNames.get(event.assignedTo) : undefined}
						onSelect={onSelect}
						className={cn('absolute z-10', startsBeforeWindow && 'rounded-t-none', endsAfterWindow && 'rounded-b-none')}
						style={{
							top: `${top * 100}%`,
							height: `${height * 100}%`,
							left: `calc(${(column / columns) * 100}% + 2px)`,
							width: `calc(${(1 / columns) * 100}% - 4px)`,
						}}
					/>
				);
			})}
		</div>
	);
}

export function DayHeader({ day, onSelect }: { day: Date; onSelect?: (day: Date) => void }) {
	const today = isToday(day);

	const content = (
		<>
			<span className="text-[11px] tracking-[0.15em] text-muted-foreground uppercase">{format(day, 'EEE')}</span>
			<span
				className={cn(
					'flex size-7 items-center justify-center rounded-full text-sm font-semibold tabular-nums',
					today && 'bg-primary text-primary-foreground',
				)}
			>
				{format(day, 'd')}
			</span>
		</>
	);

	if (!onSelect) return <div className="flex flex-col items-center gap-0.5 py-2">{content}</div>;

	return (
		<button
			type="button"
			onClick={() => onSelect(day)}
			className="flex flex-col items-center gap-0.5 rounded-md py-2 hover:bg-muted/60"
		>
			{content}
		</button>
	);
}
