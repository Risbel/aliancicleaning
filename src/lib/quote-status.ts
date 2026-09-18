import type { Database, Tables } from '@/types/supabase';
import type { QuoteStatusFilter } from '@/services/quotes';
import type { badgeVariants } from '@/components/ui/badge-variants';
import type { VariantProps } from 'class-variance-authority';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
export type QuoteStatus = Database['public']['Enums']['quote_status'];

export function getQuoteStatusFilter(
	quote: Pick<Tables<'quotes'>, 'status' | 'desired_visit_date'>,
): QuoteStatusFilter {
	if (quote.status === 'pending' && new Date(quote.desired_visit_date) < new Date()) return 'expired';
	return quote.status;
}

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

export const QUOTE_STATUS_CUSTOMER_MESSAGE: Record<QuoteStatusFilter, string> = {
	all: '',
	pending:
		"We've received your request and our team is reviewing it. You'll get an email as soon as it's been looked at.",
	expired:
		'The date you requested has passed without a response from us. Please submit a new request, or reach out and we’ll help you reschedule.',
	reviewed:
		"Your request has been reviewed and we're putting together your price quote. We'll email it to you shortly.",
	quoted: 'Your quote is ready! Check your email for a confirmation link to lock in your appointment.',
	accepted: "You're all set — this cleaning is on our calendar. We'll see you then!",
	declined: "This request wasn't able to move forward. Feel free to submit a new one whenever you're ready.",
	completed: 'This cleaning is complete. Thanks for trusting us with your home!',
	cancelled: "This request has been cancelled. Let us know if you'd like to book again.",
};
