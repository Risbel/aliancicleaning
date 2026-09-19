import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddStaffMember, useFindUserByEmail } from '@/hooks/queries/use-staff';
import { STAFF_ROLES } from '@/lib/staff-role';
import { staffLookupSchema, type StaffLookupValues } from '@/lib/validation/staff-schema';
import type { StaffRole } from '@/services/staff';

export function AddStaffDialog({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
	const [lookupEmail, setLookupEmail] = useState<string>();
	const [role, setRole] = useState<StaffRole>('staff');
	const { data: foundUser, isFetching, isError, error } = useFindUserByEmail(lookupEmail);
	const addStaffMember = useAddStaffMember();

	const form = useForm<StaffLookupValues>({
		resolver: zodResolver(staffLookupSchema),
		defaultValues: { email: '' },
	});

	function onSubmit(values: StaffLookupValues) {
		setLookupEmail(values.email.toLowerCase());
	}

	async function handleAdd() {
		if (!foundUser) return;
		try {
			await addStaffMember.mutateAsync({ userId: foundUser.id, role });
			toast.success(`${foundUser.full_name} added to staff.`);
			onOpenChange(false);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to add staff member.');
		}
	}

	const hasSearched = !!lookupEmail && !isFetching;

	return (
		<Dialog open onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add staff</DialogTitle>
					<DialogDescription>
						Find a registered user by their exact email address and give them access to the dashboard.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem className="flex-1">
									<FormLabel className="sr-only">Email</FormLabel>
									<FormControl>
										<Input type="email" placeholder="name@example.com" autoComplete="off" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" variant="outline" disabled={isFetching}>
							{isFetching ? 'Searching...' : 'Find'}
						</Button>
					</form>
				</Form>

				{hasSearched && isError && (
					<Alert variant="destructive">
						<AlertDescription>{error instanceof Error ? error.message : 'Failed to look up user.'}</AlertDescription>
					</Alert>
				)}

				{hasSearched && !isError && !foundUser && (
					<p className="text-sm text-muted-foreground">
						No registered user with that email. They need to sign up on the site first.
					</p>
				)}

				{hasSearched && foundUser && (
					<div className="flex flex-col gap-4 rounded-lg border border-input p-4">
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0">
								<p className="truncate font-medium text-foreground">{foundUser.full_name}</p>
								<p className="truncate text-sm text-muted-foreground">{foundUser.email}</p>
							</div>
							<div className="flex flex-wrap justify-end gap-1">
								{foundUser.is_staff && <Badge variant="secondary">Already staff</Badge>}
								{!foundUser.email_confirmed && <Badge variant="destructive">Email not verified</Badge>}
							</div>
						</div>

						{!foundUser.is_staff && (
							<div className="grid gap-2">
								<Label>Role</Label>
								<Select value={role} onValueChange={(value) => setRole(value as StaffRole)}>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{STAFF_ROLES.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="text-xs text-muted-foreground">
									{STAFF_ROLES.find((option) => option.value === role)?.description}
								</p>
							</div>
						)}
					</div>
				)}

				<DialogFooter>
					<Button
						type="button"
						onClick={handleAdd}
						disabled={!hasSearched || !foundUser || foundUser.is_staff || addStaffMember.isPending}
					>
						{addStaffMember.isPending ? 'Adding...' : 'Add to staff'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
