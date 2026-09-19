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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSetStaffRole } from '@/hooks/queries/use-staff';
import { STAFF_ROLES, getStaffRole } from '@/lib/staff-role';
import type { StaffMember, StaffRole } from '@/services/staff';

export function ChangeStaffRoleDialog({
	member,
	onOpenChange,
}: {
	member: StaffMember;
	onOpenChange: (open: boolean) => void;
}) {
	const [selectedRole, setSelectedRole] = useState<StaffRole>(member.role);
	const setStaffRole = useSetStaffRole();

	async function handleSubmit() {
		try {
			await setStaffRole.mutateAsync({ userId: member.id, role: selectedRole });
			toast.success(`${member.full_name} is now ${getStaffRole(selectedRole).label.toLowerCase()}.`);
			onOpenChange(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to change role.');
		}
	}

	return (
		<Dialog open onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Change role</DialogTitle>
					<DialogDescription>
						{member.full_name}
						{member.email && <> &middot; {member.email}</>}
					</DialogDescription>
				</DialogHeader>

				<RadioGroup value={selectedRole} onValueChange={(value) => setSelectedRole(value as StaffRole)}>
					{STAFF_ROLES.map((option) => (
						<div key={option.value} className="flex items-start gap-3">
							<RadioGroupItem className="mt-0.5 cursor-pointer" value={option.value} id={`role-${option.value}`} />
							<Label htmlFor={`role-${option.value}`} className="flex cursor-pointer flex-col items-start gap-1">
								<span>{option.label}</span>
								<span className="text-xs font-normal text-muted-foreground">{option.description}</span>
							</Label>
						</div>
					))}
				</RadioGroup>

				<DialogFooter>
					<Button
						type="button"
						onClick={handleSubmit}
						disabled={selectedRole === member.role || setStaffRole.isPending}
					>
						{setStaffRole.isPending ? 'Updating...' : 'Update role'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
