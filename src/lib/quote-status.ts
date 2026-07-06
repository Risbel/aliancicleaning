import type { Database } from '@/types/supabase';
import type { QuoteStatusFilter } from '@/services/quotes';
import type { badgeVariants } from '@/components/ui/badge-variants';
import type { VariantProps } from 'class-variance-authority';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
export type QuoteStatus = Database['public']['Enums']['quote_status'];

export const QUOTE_STATUSES: {
	value: QuoteStatus;
	label: string;
	infoLabel: string;
	disabledLabel?: string;
}[] = [
	{
		value: 'pending',
		label: 'Pending',
		infoLabel: 'Quote has not been reviewed yet',
		disabledLabel: 'Cannot revert to Pending once the quote is accepted',
	},
	{
		value: 'reviewed',
		label: 'Reviewed',
		infoLabel: 'Quote has been reviewed by staff',
		disabledLabel: 'Cannot revert to Reviewed once the quote is accepted',
	},
	{
		value: 'quoted',
		label: 'Quoted',
		infoLabel: 'A price quote has been sent to the customer',
		disabledLabel: 'Cannot revert to Quoted once the quote is accepted',
	},
	{
		value: 'accepted',
		label: 'Accepted',
		infoLabel: 'Customer has accepted the quote',
		disabledLabel: 'Accepted is set automatically when the customer confirms the quote',
	},
	{
		value: 'declined',
		label: 'Declined',
		infoLabel: 'Customer declined the quote',
	},
	{
		value: 'completed',
		label: 'Completed',
		infoLabel: 'Service has been completed',
	},
	{
		value: 'cancelled',
		label: 'Cancelled',
		infoLabel: 'Quote has been cancelled',
	},
];

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
