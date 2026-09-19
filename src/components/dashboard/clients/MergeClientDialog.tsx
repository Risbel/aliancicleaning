import { useState } from 'react';
import { toast } from 'sonner';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccountCustomers, useMergeCustomers } from '@/hooks/queries/use-customers';
import type { CustomerWithQuoteCount } from '@/services/customers';

export function MergeClientDialog({
	customer,
	onOpenChange,
}: {
	customer: CustomerWithQuoteCount;
	onOpenChange: (open: boolean) => void;
}) {
	const { data: accounts, isLoading } = useAccountCustomers();
	const mergeCustomers = useMergeCustomers();
	const [targetId, setTargetId] = useState('');
	const target = accounts?.find((account) => account.id === targetId);
	const quoteCount = customer.quotes[0]?.count ?? 0;

	async function handleMerge() {
		if (!targetId) return;
		try {
			await mergeCustomers.mutateAsync({ sourceId: customer.id, targetId });
			toast.success(`${customer.full_name} merged into ${target?.full_name ?? 'account'}.`);
			onOpenChange(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to merge clients.');
		}
	}

	return (
		<Dialog open onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Merge into account</DialogTitle>
					<DialogDescription>
						Move {customer.full_name}&apos;s history into a client who has a web account.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-2">
					<Label>Account</Label>
					<Select value={targetId} onValueChange={setTargetId} disabled={isLoading}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select a client with an account" />
						</SelectTrigger>
						<SelectContent>
							{accounts?.map((account) => (
								<SelectItem key={account.id} value={account.id}>
									{account.full_name} &middot; {account.email}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{target && (
					<Alert variant="warning">
						<AlertDescription>
							{quoteCount} {quoteCount === 1 ? 'quote' : 'quotes'} will move to {target.full_name}. Any contact details
							missing on the account will be filled from this client. This manual record will then be deleted. This
							cannot be undone.
						</AlertDescription>
					</Alert>
				)}

				<DialogFooter>
					<Button type="button" onClick={handleMerge} disabled={!targetId || mergeCustomers.isPending}>
						{mergeCustomers.isPending ? 'Merging...' : 'Merge'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
