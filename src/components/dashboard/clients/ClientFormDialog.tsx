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
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/auth/use-auth';
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/queries/use-customers';
import { customerSchema, type CustomerValues } from '@/lib/validation/customer-schema';
import type { Tables } from '@/types/supabase';

function toDefaultValues(customer: Tables<'customer_profiles'> | null): CustomerValues {
	return {
		fullName: customer?.full_name ?? '',
		phone: customer?.phone ?? '',
		email: customer?.email ?? '',
		addressLine: customer?.address_line ?? '',
		city: customer?.city ?? '',
		state: customer?.state ?? '',
		zipCode: customer?.zip_code ?? '',
	};
}

export function ClientFormDialog({
	customer,
	onOpenChange,
}: {
	customer: Tables<'customer_profiles'> | null;
	onOpenChange: (open: boolean) => void;
}) {
	const { user } = useAuth();
	const createCustomer = useCreateCustomer();
	const updateCustomer = useUpdateCustomer();
	const hasAccount = !!customer?.user_id;

	const form = useForm<CustomerValues>({
		resolver: zodResolver(customerSchema),
		defaultValues: toDefaultValues(customer),
	});

	async function onSubmit(values: CustomerValues) {
		const fields = {
			full_name: values.fullName,
			phone: values.phone,
			address_line: values.addressLine || null,
			city: values.city || null,
			state: values.state || null,
			zip_code: values.zipCode || null,
		};

		try {
			if (customer) {
				await updateCustomer.mutateAsync({
					id: customer.id,
					updates: hasAccount ? fields : { ...fields, email: values.email || null },
				});
				toast.success('Client updated.');
			} else {
				await createCustomer.mutateAsync({
					...fields,
					email: values.email || null,
					source: 'manual',
					created_by: user?.id ?? null,
				});
				toast.success('Client created.');
			}
			onOpenChange(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to save client.');
		}
	}

	return (
		<Dialog open onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{customer ? 'Edit client' : 'New client'}</DialogTitle>
					<DialogDescription>
						{customer
							? customer.full_name
							: 'Register a client who booked by phone. They can link this history to a web account later.'}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
						<FormField
							control={form.control}
							name="fullName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Phone</FormLabel>
										<FormControl>
											<Input type="tel" prefix="+1" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email {!hasAccount && '(optional)'}</FormLabel>
										<FormControl>
											<Input type="email" disabled={hasAccount} {...field} />
										</FormControl>
										{hasAccount && <FormDescription>Linked to the client&apos;s account.</FormDescription>}
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="addressLine"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Address (optional)</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-3 gap-4">
							<FormField
								control={form.control}
								name="city"
								render={({ field }) => (
									<FormItem>
										<FormLabel>City</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="state"
								render={({ field }) => (
									<FormItem>
										<FormLabel>State</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="zipCode"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Zip code</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<DialogFooter>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? 'Saving...' : customer ? 'Save' : 'Create client'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
