import {
	addDays,
	addHours,
	addMonths,
	differenceInMinutes,
	endOfDay,
	endOfMonth,
	endOfWeek,
	format,
	isSameMonth,
	isSameYear,
	isValid,
	parse,
	startOfDay,
	startOfMonth,
	startOfWeek,
} from 'date-fns';

export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 21;
export const DAY_WINDOW_MINUTES = (DAY_END_HOUR - DAY_START_HOUR) * 60;

const MIN_EVENT_MINUTES = 15;

export type CalendarEvent = {
	id: string;
	start: Date;
	end: Date;
	assignedTo: string | null;
};

export type PositionedEvent<T extends CalendarEvent> = {
	event: T;
	column: number;
	columns: number;
};

export type TimeRange = {
	start: Date;
	end: Date;
};

export type CalendarMode = 'month' | 'week' | 'day';

export const CALENDAR_MODES: { value: CalendarMode; label: string }[] = [
	{ value: 'month', label: 'Month' },
	{ value: 'week', label: 'Week' },
	{ value: 'day', label: 'Day' },
];

export const DEFAULT_CALENDAR_MODE: CalendarMode = 'week';

const ANCHOR_FORMAT = 'yyyy-MM-dd';

export function parseCalendarMode(value: string | null): CalendarMode {
	return CALENDAR_MODES.some((mode) => mode.value === value) ? (value as CalendarMode) : DEFAULT_CALENDAR_MODE;
}

export function parseCalendarAnchor(value: string | null, now = new Date()): Date {
	if (!value) return startOfDay(now);
	const parsed = parse(value, ANCHOR_FORMAT, now);
	return isValid(parsed) ? startOfDay(parsed) : startOfDay(now);
}

export function formatCalendarAnchor(date: Date) {
	return format(date, ANCHOR_FORMAT);
}

export function getCalendarRange(mode: CalendarMode, anchor: Date): TimeRange {
	if (mode === 'day') {
		const start = startOfDay(anchor);
		return { start, end: addDays(start, 1) };
	}

	if (mode === 'week') {
		const start = startOfWeek(anchor);
		return { start, end: addDays(start, 7) };
	}

	const start = startOfWeek(startOfMonth(anchor));
	return { start, end: startOfDay(addDays(endOfWeek(endOfMonth(anchor)), 1)) };
}

export function shiftCalendarAnchor(mode: CalendarMode, anchor: Date, direction: 1 | -1) {
	if (mode === 'day') return addDays(anchor, direction);
	if (mode === 'week') return addDays(anchor, direction * 7);
	return addMonths(anchor, direction);
}

export function getCalendarLabel(mode: CalendarMode, anchor: Date) {
	if (mode === 'day') return format(anchor, 'EEEE, MMMM d, yyyy');
	if (mode === 'month') return format(anchor, 'MMMM yyyy');

	const start = startOfWeek(anchor);
	const end = addDays(start, 6);
	if (isSameMonth(start, end)) return `${format(start, 'MMMM d')} - ${format(end, 'd, yyyy')}`;
	if (isSameYear(start, end)) return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
	return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
}

export function getDayWindow(day: Date): TimeRange {
	const start = addHours(startOfDay(day), DAY_START_HOUR);
	return { start, end: addHours(startOfDay(day), DAY_END_HOUR) };
}

export function getEventsForDay<T extends CalendarEvent>(events: T[], day: Date) {
	const dayStart = startOfDay(day);
	const dayEnd = endOfDay(day);
	return events
		.filter((event) => event.start <= dayEnd && event.end >= dayStart)
		.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function getEventPosition(event: CalendarEvent, day: Date) {
	const window = getDayWindow(day);
	const startMinutes = differenceInMinutes(event.start, window.start);
	const endMinutes = differenceInMinutes(event.end, window.start);
	const clampedStart = Math.max(0, Math.min(DAY_WINDOW_MINUTES, startMinutes));
	const clampedEnd = Math.max(clampedStart + MIN_EVENT_MINUTES, Math.min(DAY_WINDOW_MINUTES, endMinutes));

	return {
		top: clampedStart / DAY_WINDOW_MINUTES,
		height: (clampedEnd - clampedStart) / DAY_WINDOW_MINUTES,
		startsBeforeWindow: startMinutes < 0,
		endsAfterWindow: endMinutes > DAY_WINDOW_MINUTES,
	};
}

export function getTimeOffset(date: Date, day: Date) {
	const window = getDayWindow(day);
	return differenceInMinutes(date, window.start) / DAY_WINDOW_MINUTES;
}

function overlaps(a: CalendarEvent, b: CalendarEvent) {
	return a.start < b.end && b.start < a.end;
}

export function layoutDayEvents<T extends CalendarEvent>(events: T[]): PositionedEvent<T>[] {
	const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime());

	const positioned: PositionedEvent<T>[] = [];
	let cluster: PositionedEvent<T>[] = [];
	let columnEnds: number[] = [];
	let clusterEnd = -Infinity;

	function flushCluster() {
		for (const item of cluster) item.columns = columnEnds.length;
		positioned.push(...cluster);
		cluster = [];
		columnEnds = [];
		clusterEnd = -Infinity;
	}

	for (const event of sorted) {
		if (event.start.getTime() >= clusterEnd) flushCluster();

		let column = columnEnds.findIndex((end) => end <= event.start.getTime());
		if (column === -1) {
			column = columnEnds.length;
			columnEnds.push(event.end.getTime());
		} else {
			columnEnds[column] = event.end.getTime();
		}

		cluster.push({ event, column, columns: 1 });
		clusterEnd = Math.max(clusterEnd, event.end.getTime());
	}

	flushCluster();
	return positioned;
}

function mergeRanges(ranges: TimeRange[]): TimeRange[] {
	const sorted = [...ranges].sort((a, b) => a.start.getTime() - b.start.getTime());
	const merged: TimeRange[] = [];

	for (const range of sorted) {
		const last = merged[merged.length - 1];
		if (last && range.start <= last.end) {
			if (range.end > last.end) last.end = range.end;
			continue;
		}
		merged.push({ start: range.start, end: range.end });
	}

	return merged;
}

function clampToWindow(events: CalendarEvent[], day: Date): TimeRange[] {
	const window = getDayWindow(day);
	return events
		.map((event) => ({
			start: event.start < window.start ? window.start : event.start,
			end: event.end > window.end ? window.end : event.end,
		}))
		.filter((range) => range.end > range.start);
}

export function getBusyRanges(events: CalendarEvent[], day: Date) {
	return mergeRanges(clampToWindow(events, day));
}

export function getFreeGaps(events: CalendarEvent[], day: Date, minGapMinutes = 30): TimeRange[] {
	const window = getDayWindow(day);
	const busy = getBusyRanges(events, day);
	const gaps: TimeRange[] = [];
	let cursor = window.start;

	for (const range of busy) {
		if (range.start > cursor) gaps.push({ start: cursor, end: range.start });
		if (range.end > cursor) cursor = range.end;
	}

	if (cursor < window.end) gaps.push({ start: cursor, end: window.end });

	return gaps.filter((gap) => differenceInMinutes(gap.end, gap.start) >= minGapMinutes);
}

export function getConflicts<T extends CalendarEvent>(events: T[]) {
	const conflicts: { a: T; b: T }[] = [];

	for (let i = 0; i < events.length; i += 1) {
		for (let j = i + 1; j < events.length; j += 1) {
			const a = events[i];
			const b = events[j];
			if (!a.assignedTo || a.assignedTo !== b.assignedTo) continue;
			if (overlaps(a, b)) conflicts.push({ a, b });
		}
	}

	return conflicts;
}

export function getConflictingEventIds(events: CalendarEvent[]) {
	const ids = new Set<string>();
	for (const { a, b } of getConflicts(events)) {
		ids.add(a.id);
		ids.add(b.id);
	}
	return ids;
}

export function getDayTotals(events: CalendarEvent[], day: Date) {
	const busyMinutes = getBusyRanges(events, day).reduce(
		(total, range) => total + differenceInMinutes(range.end, range.start),
		0,
	);
	const jobMinutes = clampToWindow(events, day).reduce(
		(total, range) => total + differenceInMinutes(range.end, range.start),
		0,
	);

	return {
		busyMinutes,
		jobMinutes,
		freeMinutes: Math.max(0, DAY_WINDOW_MINUTES - busyMinutes),
		jobCount: events.length,
		conflictCount: getConflicts(events).length,
		load: Math.min(1, busyMinutes / DAY_WINDOW_MINUTES),
	};
}
