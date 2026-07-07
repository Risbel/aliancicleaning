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
import { useSendQuoteConfirmation } from '@/hooks/queries/use-quotes';
import type { Tables } from '@/types/supabase';

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
	const [emailSent, setEmailSent] = useState<boolean | null>(null);
	const sendConfirmation = useSendQuoteConfirmation();

	async function handleSend() {
		try {
			const result = await sendConfirmation.mutateAsync(currentQuote.id);

			setCurrentQuote(result.quote);
			setEmailSent(result.emailSent);
			setSent(true);

			if (result.emailSent) {
				toast.success(`Confirmation email sent to ${result.quote.customer_email}`);
			} else {
				toast.error(result.emailError ?? 'Email could not be sent. Share the link manually.');
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to send confirmation.');
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
							{emailSent === true &&
								`Confirmation email sent to ${currentQuote.customer_email}. You can also share this link manually:`}
							{emailSent === false &&
								'The email could not be sent, so share this confirmation link with the client manually:'}
							{emailSent === null && 'Share this confirmation link with the client:'}
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
						<Button className="space-x-3" type="button" onClick={handleSend} disabled={sendConfirmation.isPending}>
							{sendConfirmation.isPending ? 'Sending...' : 'Send'} <HugeiconsIcon icon={Send} className="size-4" />
						</Button>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}
