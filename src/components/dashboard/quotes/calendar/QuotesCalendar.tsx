import { useMemo } from 'react';
import { DayView } from '@/components/dashboard/quotes/calendar/DayView';
import { MonthView } from '@/components/dashboard/quotes/calendar/MonthView';
import { QuotesCalendarToolbar } from '@/components/dashboard/quotes/calendar/QuotesCalendarToolbar';
import { WeekView } from '@/components/dashboard/quotes/calendar/WeekView';
import { useStaffNames } from '@/hooks/queries/use-profile';
import { useQuotesCalendar } from '@/hooks/queries/use-quotes';
import { getCalendarRange, type CalendarEvent, type CalendarMode } from '@/lib/calendar';
import { getQuoteTimeRange } from '@/lib/quote-duration';
import type { QuoteActions } from '@/components/dashboard/quotes/QuoteRowActions';
import type { QuoteStatus, QuoteWithPlan } from '@/services/quotes';

export type QuoteEvent = CalendarEvent & {
	quote: QuoteWithPlan;
};

export function QuotesCalendar({
	mode,
	anchor,
	statuses,
	search,
	assignedTo,
	customerId,
	onModeChange,
	onAnchorChange,
	actions,
}: {
	mode: CalendarMode;
	anchor: Date;
	statuses: QuoteStatus[];
	search?: string;
	assignedTo?: string;
	customerId?: string;
	onModeChange: (mode: CalendarMode) => void;
	onAnchorChange: (anchor: Date) => void;
	actions: QuoteActions;
}) {
	const range = getCalendarRange(mode, anchor);
	const staffNames = useStaffNames();

	const {
		data: quotes,
		isLoading,
		isError,
	} = useQuotesCalendar({
		from: range.start.toISOString(),
		to: range.end.toISOString(),
		statuses,
		search,
		assignedTo,
		customerId,
	});

	const events = useMemo<QuoteEvent[]>(() => {
		if (!quotes) return [];
		return quotes.map((quote) => {
			const { start, end } = getQuoteTimeRange(quote, quote.cleaning_plans?.type);
			return { id: quote.id, start, end, assignedTo: quote.assigned_to, quote };
		});
	}, [quotes]);

	function selectDay(day: Date) {
		onAnchorChange(day);
		onModeChange('day');
	}

	return (
		<div>
			<QuotesCalendarToolbar mode={mode} anchor={anchor} onModeChange={onModeChange} onAnchorChange={onAnchorChange} />

			{isError && <p className="text-sm text-destructive">Failed to load the calendar.</p>}
			{isLoading && <p className="text-sm text-muted-foreground">Loading calendar...</p>}

			{!isLoading && !isError && mode === 'month' && (
				<MonthView
					anchor={anchor}
					range={range}
					events={events}
					staffNames={staffNames}
					onSelectQuote={actions.onView}
					onSelectDay={selectDay}
				/>
			)}

			{!isLoading && !isError && mode === 'week' && (
				<WeekView
					anchor={anchor}
					events={events}
					actions={actions}
					staffNames={staffNames}
					onSelectQuote={actions.onView}
					onSelectDay={selectDay}
					onAnchorChange={onAnchorChange}
				/>
			)}

			{!isLoading && !isError && mode === 'day' && (
				<DayView
					anchor={anchor}
					events={events}
					actions={actions}
					staffNames={staffNames}
					onSelectQuote={actions.onView}
				/>
			)}
		</div>
	);
}
