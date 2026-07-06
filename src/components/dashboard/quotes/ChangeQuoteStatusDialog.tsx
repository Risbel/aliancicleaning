import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { QUOTE_STATUSES, type QuoteStatus } from '@/lib/quote-status';
import type { Tables } from '@/types/supabase';

const LOCKED_AFTER_ACCEPTED: QuoteStatus[] = ['pending', 'reviewed', 'quoted'];

function isStatusDisabled(status: QuoteStatus, quote: Tables<'quotes'>) {
	if (status === 'accepted') return true;
	if (quote.status === 'accepted') return LOCKED_AFTER_ACCEPTED.includes(status);
	return false;
}

export function ChangeQuoteStatusDialog({
	quote,
	onOpenChange,
	onSubmit,
	isPending,
}: {
	quote: Tables<'quotes'>;
	onOpenChange: (open: boolean) => void;
	onSubmit: (status: QuoteStatus) => void;
	isPending: boolean;
}) {
	const [selectedStatus, setSelectedStatus] = useState<QuoteStatus>(quote.status);

	return (
		<Dialog open onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Change status</DialogTitle>
					<DialogDescription>
						{quote.customer_name} &middot; {quote.customer_email}
					</DialogDescription>
				</DialogHeader>

				<TooltipProvider>
					<RadioGroup value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as QuoteStatus)}>
						{QUOTE_STATUSES.map((option) => {
							const disabled = isStatusDisabled(option.value, quote);
							const hint = disabled ? option.disabledLabel : option.infoLabel;
							return (
								<Tooltip delayDuration={500} key={option.value}>
									<TooltipTrigger asChild>
										<div className="flex items-center gap-3 w-fit">
											<RadioGroupItem
												className="cursor-pointer"
												value={option.value}
												id={`status-${option.value}`}
												disabled={disabled}
											/>
											<Label
												htmlFor={`status-${option.value}`}
												className={'cursor-pointer ' + (disabled ? 'opacity-50' : undefined)}
											>
												{option.label}
											</Label>
										</div>
									</TooltipTrigger>
									{hint ? (
										<TooltipContent className="translate-x-2" side="right">
											{hint}
										</TooltipContent>
									) : null}
								</Tooltip>
							);
						})}
					</RadioGroup>
				</TooltipProvider>

				<DialogFooter>
					<Button
						type="button"
						onClick={() => onSubmit(selectedStatus)}
						disabled={selectedStatus === quote.status || isPending}
					>
						{isPending ? 'Updating...' : 'Update status'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
