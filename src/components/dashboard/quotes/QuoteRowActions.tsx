import { HugeiconsIcon } from '@hugeicons/react';
import {
	EyeIcon,
	MoreHorizontalIcon,
	Pen,
	RadioButtonFreeIcons,
	Send,
	Trash,
	UserCheck,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { QuoteWithPlan } from '@/services/quotes';

export type QuoteActions = {
	isAdmin: boolean;
	onView: (quote: QuoteWithPlan) => void;
	onEdit: (quote: QuoteWithPlan) => void;
	onChangeStatus: (quote: QuoteWithPlan) => void;
	onAssign: (quote: QuoteWithPlan) => void;
	onSendConfirmation: (quote: QuoteWithPlan) => void;
	onDelete: (quote: QuoteWithPlan) => void;
};

export function canSendConfirmation(quote: QuoteWithPlan) {
	return (
		!!quote.customer_email &&
		quote.final_price != null &&
		quote.status !== 'accepted' &&
		quote.status !== 'quoted' &&
		quote.status !== 'completed' &&
		quote.status !== 'cancelled'
	);
}

export function QuoteRowActions({
	quote,
	actions,
	triggerClassName,
}: {
	quote: QuoteWithPlan;
	actions: QuoteActions;
	triggerClassName?: string;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon-sm" className={triggerClassName}>
					<HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem className="justify-between" onClick={() => actions.onView(quote)}>
					View details <HugeiconsIcon icon={EyeIcon} className="size-4" />
				</DropdownMenuItem>
				<DropdownMenuItem className="justify-between" onClick={() => actions.onEdit(quote)}>
					Edit <HugeiconsIcon icon={Pen} className="size-4" />
				</DropdownMenuItem>
				<DropdownMenuItem className="justify-between" onClick={() => actions.onChangeStatus(quote)}>
					Change status <HugeiconsIcon icon={RadioButtonFreeIcons} className="size-4" />
				</DropdownMenuItem>
				<DropdownMenuItem
					disabled={!canSendConfirmation(quote)}
					onClick={() => actions.onSendConfirmation(quote)}
					className="justify-between"
				>
					Send confirmation <HugeiconsIcon icon={Send} className="size-4" />
				</DropdownMenuItem>
				{actions.isAdmin && (
					<DropdownMenuItem className="justify-between" onClick={() => actions.onAssign(quote)}>
						Assign <HugeiconsIcon icon={UserCheck} className="size-4" />
					</DropdownMenuItem>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem className="justify-between" variant="destructive" onClick={() => actions.onDelete(quote)}>
					Delete <HugeiconsIcon icon={Trash} className="size-4" />
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
