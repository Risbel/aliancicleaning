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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateQuote } from '@/hooks/queries/use-quotes';
import { useStaffProfiles } from '@/hooks/queries/use-profile';
import type { Tables } from '@/types/supabase';

export function AssignQuoteDialog({
	quote,
	onOpenChange,
}: {
	quote: Tables<'quotes'>;
	onOpenChange: (open: boolean) => void;
}) {
	const { data: staff, isLoading } = useStaffProfiles();
	const updateQuote = useUpdateQuote();
	const [assignedTo, setAssignedTo] = useState(quote.assigned_to ?? '');

	async function handleAssign() {
		await updateQuote.mutateAsync({ id: quote.id, updates: { assigned_to: assignedTo || null } });
		onOpenChange(false);
	}

	return (
		<Dialog open onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Assign quote</DialogTitle>
					<DialogDescription>
						{quote.customer_name} &middot; {quote.customer_email}
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-2">
					<Label>Assigned staff</Label>
					<Select value={assignedTo} onValueChange={setAssignedTo} disabled={isLoading}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select a staff member" />
						</SelectTrigger>
						<SelectContent>
							{staff?.map((member) => (
								<SelectItem key={member.id} value={member.id}>
									{member.full_name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<DialogFooter>
					<Button type="button" onClick={handleAssign} disabled={updateQuote.isPending}>
						{updateQuote.isPending ? 'Assigning...' : 'Assign'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
