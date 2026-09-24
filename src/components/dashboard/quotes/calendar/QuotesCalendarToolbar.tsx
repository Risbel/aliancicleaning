import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon, Calendar03Icon } from '@hugeicons/core-free-icons';
import { isSameDay, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CALENDAR_MODES, getCalendarLabel, shiftCalendarAnchor, type CalendarMode } from '@/lib/calendar';
import { cn } from '@/lib/utils';

export function QuotesCalendarToolbar({
	mode,
	anchor,
	onModeChange,
	onAnchorChange,
}: {
	mode: CalendarMode;
	anchor: Date;
	onModeChange: (mode: CalendarMode) => void;
	onAnchorChange: (anchor: Date) => void;
}) {
	const today = startOfDay(new Date());

	return (
		<div className="mb-4 flex flex-wrap items-center gap-2">
			<div className="flex items-center gap-1">
				<Button
					variant="outline"
					size="icon-sm"
					onClick={() => onAnchorChange(shiftCalendarAnchor(mode, anchor, -1))}
					aria-label={`Previous ${mode}`}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
				</Button>
				<Button
					variant="outline"
					size="icon-sm"
					onClick={() => onAnchorChange(shiftCalendarAnchor(mode, anchor, 1))}
					aria-label={`Next ${mode}`}
				>
					<HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
				</Button>
			</div>

			<Button variant="outline" size="sm" onClick={() => onAnchorChange(today)} disabled={isSameDay(anchor, today)}>
				Today
			</Button>

			<Popover>
				<PopoverTrigger asChild>
					<Button variant="ghost" size="sm" className="gap-2 font-semibold">
						<HugeiconsIcon icon={Calendar03Icon} className="size-4" />
						{getCalendarLabel(mode, anchor)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={anchor}
						defaultMonth={anchor}
						onSelect={(date) => date && onAnchorChange(startOfDay(date))}
						captionLayout="dropdown"
					/>
				</PopoverContent>
			</Popover>

			<div className="ml-auto flex items-center gap-1 rounded-4xl border border-input p-1">
				{CALENDAR_MODES.map((option) => (
					<Button
						key={option.value}
						variant={mode === option.value ? 'default' : 'ghost'}
						size="sm"
						className={cn('h-7', mode !== option.value && 'text-muted-foreground')}
						onClick={() => onModeChange(option.value)}
					>
						{option.label}
					</Button>
				))}
			</div>
		</div>
	);
}
