import type { badgeVariants } from '@/components/ui/badge-variants';
import type { VariantProps } from 'class-variance-authority';
import type { StaffRole } from '@/services/staff';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export const STAFF_ROLES: {
	value: StaffRole;
	label: string;
	description: string;
	badgeVariant: BadgeVariant;
}[] = [
	{
		value: 'admin',
		label: 'Admin',
		description: 'Full access: sees all quotes, assigns work, manages plans and staff.',
		badgeVariant: 'primary',
	},
	{
		value: 'manager',
		label: 'Manager',
		description: 'Team lead. Same dashboard access as staff for now.',
		badgeVariant: 'secondary',
	},
	{
		value: 'staff',
		label: 'Staff',
		description: 'Sees and works on the quotes assigned to them.',
		badgeVariant: 'default',
	},
];

export function getStaffRole(role: StaffRole) {
	return STAFF_ROLES.find((option) => option.value === role) ?? STAFF_ROLES[2];
}
