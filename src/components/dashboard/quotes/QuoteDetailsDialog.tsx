import { format } from 'date-fns';
import { HugeiconsIcon } from '@hugeicons/react';
import { Call02Icon, Copy01Icon, GoogleMapsIcon, Mail01Icon } from '@hugeicons/core-free-icons';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QUOTE_STATUS_BADGE_VARIANT } from '@/lib/quote-status';
import type { Tables } from '@/types/supabase';
import type { ReactNode } from 'react';

async function copyToClipboard(value: string, label: string) {
	try {
		await navigator.clipboard.writeText(value);
		toast(`${label} copied.`);
	} catch (error) {
		toast.error(error instanceof Error ? error.message : `Failed to copy ${label.toLowerCase()}.`);
	}
}

function CopyButton({ value, label }: { value: string; label: string }) {
	return (
		<Button variant="ghost" size="icon-xs" onClick={() => copyToClipboard(value, label)}>
			<HugeiconsIcon icon={Copy01Icon} className="size-4" />
			<span className="sr-only">Copy {label}</span>
		</Button>
	);
}

function DetailRow({ label, value, actions }: { label: string; value: ReactNode; actions?: ReactNode }) {
	return (
		<div className="flex items-center justify-between gap-4 py-1">
			<span className="text-muted-foreground">{label}</span>
			<div className="flex items-center gap-1">
				<span className="text-right font-medium text-foreground">{value}</span>
				{actions}
			</div>
		</div>
	);
}

function buildDetailsText(quote: Tables<'quotes'>, address: string) {
	const lines = [
		['Status', quote.status],
		['Name', quote.customer_name],
		['Email', quote.customer_email],
		['Phone', quote.customer_phone],
		['Address', address || '-'],
		['Zip code', quote.zip_code ?? '-'],
		['Desired visit', format(new Date(quote.desired_visit_date), 'M/d/yyyy h:mm a')],
		['Bedrooms', quote.bedrooms],
		['Bathrooms', quote.bathrooms],
		['Square footage', quote.square_footage],
		['Has pets', quote.has_pets ? 'Yes' : 'No'],
		['Estimated price', quote.estimated_price != null ? `$${quote.estimated_price.toFixed(2)}` : '-'],
		['Final price', quote.final_price != null ? `$${quote.final_price.toFixed(2)}` : '-'],
		['Customer note', quote.customer_note ?? '-'],
		['Admin notes', quote.admin_notes ?? '-'],
		['Created', format(new Date(quote.created_at), 'M/d/yyyy h:mm a')],
	];
	return lines.map(([label, value]) => `${label}: ${value}`).join('\n');
}

export function QuoteDetailsDialog({
	quote,
	onOpenChange,
}: {
	quote: Tables<'quotes'>;
	onOpenChange: (open: boolean) => void;
}) {
	const address = [quote.address_line, quote.city, quote.state, quote.zip_code].filter(Boolean).join(', ');
	const mapsUrl = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null;

	return (
		<Dialog open onOpenChange={onOpenChange}>
			<DialogContent className="max-h-full md:max-h-5/6 overflow-hidden overflow-y-scroll pb-24">
				<DialogHeader>
					<DialogTitle>Quote details</DialogTitle>
					<DialogDescription>
						{quote.customer_name} &middot; {quote.customer_email}
					</DialogDescription>
				</DialogHeader>

				<div className="rounded-lg border border-input p-4 text-sm">
					<div className="mb-2 flex items-center justify-between border-b border-input pb-2">
						<span className="text-xs font-medium uppercase text-muted-foreground">All details</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => copyToClipboard(buildDetailsText(quote, address), 'Quote details')}
						>
							<HugeiconsIcon icon={Copy01Icon} className="size-4" />
							Copy all
						</Button>
					</div>

					<DetailRow
						label="Status"
						value={<Badge variant={QUOTE_STATUS_BADGE_VARIANT[quote.status]}>{quote.status}</Badge>}
					/>
					<DetailRow
						label="Name"
						value={quote.customer_name}
						actions={<CopyButton value={quote.customer_name} label="Name" />}
					/>
					<DetailRow
						label="Email"
						value={quote.customer_email}
						actions={
							<>
								<CopyButton value={quote.customer_email} label="Email" />
								<Button variant="ghost" size="icon-xs" asChild>
									<a href={`mailto:${quote.customer_email}`}>
										<HugeiconsIcon icon={Mail01Icon} className="size-4" />
										<span className="sr-only">Email {quote.customer_name}</span>
									</a>
								</Button>
							</>
						}
					/>
					<DetailRow
						label="Phone"
						value={quote.customer_phone}
						actions={
							<>
								<CopyButton value={quote.customer_phone} label="Phone" />
								<Button variant="ghost" size="icon-xs" asChild>
									<a href={`tel:${quote.customer_phone}`}>
										<HugeiconsIcon icon={Call02Icon} className="size-4" />
										<span className="sr-only">Call {quote.customer_name}</span>
									</a>
								</Button>
							</>
						}
					/>
					<DetailRow
						label="Address"
						value={address || '-'}
						actions={
							mapsUrl && (
								<Button variant="ghost" size="icon-xs" asChild>
									<a href={mapsUrl} target="_blank" rel="noopener noreferrer">
										<HugeiconsIcon icon={GoogleMapsIcon} className="size-4" />
										<span className="sr-only">Open address in Google Maps</span>
									</a>
								</Button>
							)
						}
					/>
					<DetailRow label="Zip code" value={quote.zip_code ?? '-'} />
					<DetailRow label="Desired visit" value={format(new Date(quote.desired_visit_date), 'M/d/yyyy h:mm a')} />
					<DetailRow label="Bedrooms" value={quote.bedrooms} />
					<DetailRow label="Bathrooms" value={quote.bathrooms} />
					<DetailRow label="Square footage" value={quote.square_footage} />
					<DetailRow label="Has pets" value={quote.has_pets ? 'Yes' : 'No'} />
					<DetailRow
						label="Estimated price"
						value={quote.estimated_price != null ? `$${quote.estimated_price.toFixed(2)}` : '-'}
					/>
					<DetailRow label="Final price" value={quote.final_price != null ? `$${quote.final_price.toFixed(2)}` : '-'} />
					<DetailRow label="Customer note" value={quote.customer_note ?? '-'} />
					<DetailRow label="Admin notes" value={quote.admin_notes ?? '-'} />
					<DetailRow label="Created" value={format(new Date(quote.created_at), 'M/d/yyyy h:mm a')} />
				</div>
			</DialogContent>
		</Dialog>
	);
}
