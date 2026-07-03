import type { QuoteStatusFilter } from '@/services/quotes';
import type { badgeVariants } from '@/components/ui/badge-variants';
import type { VariantProps } from 'class-variance-authority';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export const QUOTE_FILTER_TAGS: { value: QuoteStatusFilter; label: string }[] = [
	{ value: 'pending', label: 'Pending' },
	{ value: 'expired', label: 'Expired' },
	{ value: 'all', label: 'All' },
	{ value: 'reviewed', label: 'Reviewed' },
	{ value: 'quoted', label: 'Quoted' },
	{ value: 'accepted', label: 'Accepted' },
	{ value: 'declined', label: 'Declined' },
	{ value: 'completed', label: 'Completed' },
	{ value: 'cancelled', label: 'Cancelled' },
];

export const QUOTE_STATUS_BADGE_VARIANT: Record<QuoteStatusFilter, BadgeVariant> = {
	all: 'default',
	pending: 'secondary',
	expired: 'destructive',
	reviewed: 'secondary',
	quoted: 'primary',
	accepted: 'success',
	completed: 'success',
	declined: 'destructive',
	cancelled: 'destructive',
};
