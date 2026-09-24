import type { CSSProperties } from 'react';
import { format } from 'date-fns';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon, UserCheck } from '@hugeicons/core-free-icons';
import { QuoteRowActions, type QuoteActions } from '@/components/dashboard/quotes/QuoteRowActions';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { hasCustomQuoteDuration } from '@/lib/quote-duration';
import type { QuoteStatus } from '@/services/quotes';
import type { QuoteEvent } from '@/components/dashboard/quotes/calendar/QuotesCalendar';

const BLOCK_STYLES: Record<QuoteStatus, string> = {
	pending: 'border-dashed border-muted-foreground/50 bg-muted/70 text-foreground',
	reviewed: 'border-dashed border-secondary bg-secondary/20 text-foreground',
	quoted: 'border-dashed border-primary bg-primary/20 text-foreground',
	accepted: 'border-primary bg-primary text-primary-foreground',
	completed: 'border-accent bg-accent text-accent-foreground',
	declined: 'border-destructive/40 bg-destructive/10 text-muted-foreground',
	cancelled: 'border-destructive/40 bg-destructive/10 text-muted-foreground line-through',
};

function DetailLine({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline justify-between gap-3 text-xs">
			<span className="shrink-0 text-muted-foreground">{label}</span>
			<span className="min-w-0 truncate text-right font-medium text-foreground">{value}</span>
		</div>
	);
}

export function QuoteBlock({
	event,
	density,
	isConflicting = false,
	assigneeName,
	actions,
	onSelect,
	className,
	style,
}: {
	event: QuoteEvent;
	density: 'chip' | 'compact' | 'full';
	isConflicting?: boolean;
	assigneeName?: string;
	actions?: QuoteActions;
	onSelect: (quote: QuoteEvent['quote']) => void;
	className?: string;
	style?: CSSProperties;
}) {
	const { quote, start, end } = event;
	const price = quote.final_price ?? quote.estimated_price;
	const isEstimatedDuration = !hasCustomQuoteDuration(quote);
	const showActions = !!actions && density !== 'chip';
	const address = [quote.address_line, quote.city, quote.state].filter(Boolean).join(', ');
	const timeRange = `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;

	return (
		<HoverCard>
			<HoverCardTrigger asChild>
				<div
					style={style}
					className={cn(
						'group/block relative overflow-hidden rounded-md border',
						BLOCK_STYLES[quote.status],
						isConflicting && 'ring-2 ring-destructive',
						density === 'chip' ? 'h-5' : '',
						className,
					)}
				>
					<button
						type="button"
						onClick={() => onSelect(quote)}
						className={cn(
							'flex size-full min-w-0 flex-col overflow-hidden px-1.5 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer',
							density === 'chip' ? 'flex-row items-center gap-1 py-0 text-[11px]' : 'py-1 text-xs',
							showActions && 'pr-5',
						)}
					>
						{density === 'chip' && (
							<>
								<span className="shrink-0 font-semibold tabular-nums">{format(start, 'h:mm')}</span>
								<span className="truncate">{quote.customer_name}</span>
								{isConflicting && <HugeiconsIcon icon={Alert02Icon} className="ml-auto size-3 shrink-0" />}
							</>
						)}

						{density === 'compact' && (
							<>
								<span className="flex items-center gap-1 truncate font-semibold">
									{quote.customer_name}
									{isConflicting && <HugeiconsIcon icon={Alert02Icon} className="size-3 shrink-0" />}
								</span>
								<span className="truncate tabular-nums opacity-90">{timeRange}</span>
								<span className="flex items-center gap-1 truncate opacity-80">
									<HugeiconsIcon icon={UserCheck} className="size-3 shrink-0" />
									{assigneeName ?? 'Unassigned'}
								</span>
							</>
						)}

						{density === 'full' && (
							<>
								<span className="flex items-center gap-1 truncate font-semibold">
									{quote.customer_name}
									{isConflicting && <HugeiconsIcon icon={Alert02Icon} className="size-3.5 shrink-0" />}
								</span>
								<span className="truncate tabular-nums opacity-90">
									{timeRange}
									{isEstimatedDuration && ' (est.)'}
								</span>
								<span className="flex items-center gap-1 truncate opacity-80">
									<HugeiconsIcon icon={UserCheck} className="size-3 shrink-0" />
									{assigneeName ?? 'Unassigned'}
								</span>
								<span className="truncate opacity-80">
									{[quote.cleaning_plans?.name, quote.city, price != null ? formatCurrency(price) : null]
										.filter(Boolean)
										.join(' - ')}
								</span>
							</>
						)}
					</button>

					{showActions && (
						<QuoteRowActions
							quote={quote}
							actions={actions}
							triggerClassName="absolute top-0 right-0 size-5 opacity-0 focus-visible:opacity-100 group-hover/block:opacity-100"
						/>
					)}
				</div>
			</HoverCardTrigger>

			<HoverCardContent align="start" side="right">
				<DetailLine label="Client" value={quote.customer_name} />

				<div className="flex flex-col gap-1">
					<DetailLine label="Assigned to" value={assigneeName ?? 'Unassigned'} />
					<DetailLine label="Address" value={address || '-'} />
					<DetailLine label="Phone" value={quote.customer_phone} />
					<DetailLine label="Price" value={price != null ? formatCurrency(price) : '-'} />
				</div>

				{quote.customer_note && (
					<p className="line-clamp-3 border-t border-input pt-2 text-xs text-muted-foreground">{quote.customer_note}</p>
				)}
			</HoverCardContent>
		</HoverCard>
	);
}
