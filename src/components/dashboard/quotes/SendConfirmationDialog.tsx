import { useState } from 'react';
import { format } from 'date-fns';
import { HugeiconsIcon } from '@hugeicons/react';
import { Send } from '@hugeicons/core-free-icons';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useUpdateQuote } from '@/hooks/queries/use-quotes';
import type { Tables, TablesUpdate } from '@/types/supabase';

function isAlreadySent(quote: Tables<'quotes'>) {
	return quote.status === 'quoted' || quote.status === 'accepted';
}

export function SendConfirmationDialog({
	quote,
	onOpenChange,
}: {
	quote: Tables<'quotes'>;
	onOpenChange: (open: boolean) => void;
}) {
	const [sent, setSent] = useState(() => isAlreadySent(quote));
	const [currentQuote, setCurrentQuote] = useState(quote);
	const updateQuote = useUpdateQuote();

	async function handleSend() {
		const updates: TablesUpdate<'quotes'> = {};
		if (currentQuote.status === 'pending' || currentQuote.status === 'reviewed') updates.status = 'quoted';
		if (!currentQuote.confirmation_token) updates.confirmation_token = crypto.randomUUID();

		try {
			const updated =
				Object.keys(updates).length > 0
					? await updateQuote.mutateAsync({ id: currentQuote.id, updates })
					: currentQuote;

			setCurrentQuote(updated);
			setSent(true);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to prepare confirmation.');
		}
	}

	return (
		<Dialog open onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Send confirmation</DialogTitle>
					<DialogDescription>
						{currentQuote.customer_name} &middot; {currentQuote.customer_email}
					</DialogDescription>
				</DialogHeader>

				<div className="rounded-lg border border-input p-4 text-sm">
					<div className="flex justify-between py-1">
						<span className="text-muted-foreground">Desired visit</span>
						<span className="font-medium text-foreground">
							{format(new Date(currentQuote.desired_visit_date), 'M/d/yyyy h:mm a')}
						</span>
					</div>
					<div className="flex justify-between py-1">
						<span className="text-muted-foreground">Address</span>
						<span className="font-medium text-foreground">{currentQuote.address_line}</span>
					</div>
					<div className="flex justify-between py-1">
						<span className="text-muted-foreground">Estimated price</span>
						<span className="font-medium text-foreground">
							{currentQuote.estimated_price != null ? `$${currentQuote.estimated_price.toFixed(2)}` : '-'}
						</span>
					</div>
					<div className="flex justify-between py-1">
						<span className="text-muted-foreground">Final price</span>
						<span className="font-medium text-foreground">
							{currentQuote.final_price != null ? `$${currentQuote.final_price.toFixed(2)}` : '-'}
						</span>
					</div>
				</div>

				{sent ? (
					<>
						<p className="text-sm text-muted-foreground">
							Email sending isn't set up yet, so share this confirmation link with the client manually:
						</p>
						<label htmlFor="confirmation-link" className="sr-only">
							Confirmation link
						</label>
						<Input
							id="confirmation-link"
							name="confirmation-link"
							readOnly
							value={`${window.location.origin}/confirmation/${currentQuote.confirmation_token}`}
							onFocus={(event) => event.target.select()}
						/>
						<DialogFooter>
							<Button type="button" onClick={() => onOpenChange(false)}>
								Done
							</Button>
						</DialogFooter>
					</>
				) : (
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button className="space-x-3" type="button" onClick={handleSend} disabled={updateQuote.isPending}>
							{updateQuote.isPending ? 'Sending...' : 'Send'} <HugeiconsIcon icon={Send} className="size-4" />
						</Button>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}
