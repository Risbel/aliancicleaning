import type { MouseEvent } from 'react';
import { toast } from 'sonner';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRemoveStaffMember } from '@/hooks/queries/use-staff';
import type { StaffMember } from '@/services/staff';

export function RemoveStaffDialog({
	member,
	onOpenChange,
}: {
	member: StaffMember;
	onOpenChange: (open: boolean) => void;
}) {
	const removeStaffMember = useRemoveStaffMember();
	const assignedCount = member.total_assigned;

	async function handleConfirm(event: MouseEvent) {
		event.preventDefault();
		try {
			await removeStaffMember.mutateAsync(member.id);
			toast.success(`${member.full_name} removed from staff.`);
			onOpenChange(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to remove staff member.');
		}
	}

	return (
		<AlertDialog open onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Remove {member.full_name} from staff?</AlertDialogTitle>
					<AlertDialogDescription>
						They will lose access to the dashboard.
						{assignedCount > 0 &&
							` ${assignedCount} assigned ${assignedCount === 1 ? 'quote' : 'quotes'} (${member.open_quotes} open) will become unassigned.`}{' '}
						Their account stays, so they can still sign in as a client.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleConfirm} disabled={removeStaffMember.isPending}>
						{removeStaffMember.isPending ? 'Removing...' : 'Remove'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
