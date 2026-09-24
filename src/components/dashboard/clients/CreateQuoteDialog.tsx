import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
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
import { DateField } from '@/components/forms/DateField';
import { TimePreferenceField } from '@/components/forms/TimePreferenceField';
import { VisitHourField } from '@/components/forms/VisitHourField';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateCustomer } from '@/hooks/queries/use-customers';
import { usePlans } from '@/hooks/queries/use-plans';
import { useCreateQuote } from '@/hooks/queries/use-quotes';
import { calculateEstimatedPrice } from '@/lib/booking/estimate';
import { TIME_PREFERENCE_HOURS } from '@/lib/validation/booking-schema';
import { staffQuoteSchema, type StaffQuoteValues } from '@/lib/validation/staff-quote-schema';
import type { Tables } from '@/types/supabase';

function toDefaultValues(customer: Tables<'customer_profiles'>): Partial<StaffQuoteValues> {
	return {
		planId: '',
		bedrooms: 1,
		bathrooms: 1,
		hasPets: false,
		addressLine: customer.address_line ?? '',
		city: customer.city ?? '',
		state: customer.state ?? '',
		zipCode: customer.zip_code ?? '',
		timePreference: 'morning',
		customerPhone: customer.phone ?? '',
		adminNotes: '',
	};
}

export function CreateQuoteDialog({
	customer,
	onOpenChange,
}: {
	customer: Tables<'customer_profiles'>;
	onOpenChange: (open: boolean) => void;
}) {
	const navigate = useNavigate();
	const { data: plans } = usePlans();
	const createQuote = useCreateQuote();
	const updateCustomer = useUpdateCustomer();

	const form = useForm<StaffQuoteValues>({
		resolver: zodResolver(staffQuoteSchema),
		defaultValues: toDefaultValues(customer),
	});

	const values = form.watch();
	const selectedPlan = plans?.find((plan) => plan.id === values.planId);
	const estimatedPrice = selectedPlan
		? calculateEstimatedPrice(selectedPlan, {
				bedrooms: Number(values.bedrooms) || 0,
				bathrooms: Number(values.bathrooms) || 0,
				squareFootage: Number(values.squareFootage) || 0,
				hasPets: values.hasPets,
			})
		: 0;

	async function onSubmit(data: StaffQuoteValues) {
		if (!selectedPlan) return;

		const desiredVisitDate = new Date(data.desiredDate);
		desiredVisitDate.setHours(data.visitHour ?? TIME_PREFERENCE_HOURS[data.timePreference], 0, 0, 0);

		try {
			await createQuote.mutateAsync({
				customer_id: customer.id,
				customer_name: customer.full_name,
				customer_email: customer.email,
				customer_phone: data.customerPhone,
				address_line: data.addressLine,
				city: data.city || null,
				state: data.state || null,
				zip_code: data.zipCode || null,
				bedrooms: data.bedrooms,
				bathrooms: data.bathrooms,
				square_footage: data.squareFootage,
				has_pets: data.hasPets,
				plan_id: selectedPlan.id,
				desired_visit_date: desiredVisitDate.toISOString(),
				estimated_price: estimatedPrice,
				final_price: data.finalPrice ?? null,
				admin_notes: data.adminNotes || null,
				status: 'pending',
			});

			if (!customer.phone) {
				await updateCustomer.mutateAsync({ id: customer.id, updates: { phone: data.customerPhone } });
			}

			toast.success('Quote created.', {
				action: {
					label: 'View',
					onClick: () => navigate(`/dashboard/quotes?status=all&customer=${customer.id}`),
				},
			});
			onOpenChange(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to create quote.');
		}
	}

	return (
		<Dialog open onOpenChange={onOpenChange}>
			<DialogContent className="max-h-full overflow-y-auto sm:max-w-2xl md:max-h-5/6">
				<DialogHeader>
					<DialogTitle>New quote</DialogTitle>
					<DialogDescription>
						{customer.full_name} &middot; {customer.email ?? 'No email'} &middot;{' '}
						{customer.user_id ? 'Account' : 'Manual client'}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
						<FormField
							control={form.control}
							name="planId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Cleaning plan</FormLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select a plan" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{plans?.map((plan) => (
												<SelectItem key={plan.id} value={plan.id}>
													{plan.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-3 gap-4">
							<FormField
								control={form.control}
								name="bedrooms"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Bedrooms</FormLabel>
										<FormControl>
											<Input type="number" min={0} step={1} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="bathrooms"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Bathrooms</FormLabel>
										<FormControl>
											<Input type="number" min={0} step={1} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="squareFootage"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Square footage</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={1}
												step={1}
												placeholder="e.g. 1200"
												{...field}
												value={field.value ?? ''}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="hasPets"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-2xl border border-input px-4 py-3">
									<FormLabel className="flex-1 cursor-pointer">Pets at home</FormLabel>
									<FormControl>
										<Switch checked={field.value} onCheckedChange={field.onChange} />
									</FormControl>
								</FormItem>
							)}
						/>

						<Separator />

						<FormField
							control={form.control}
							name="addressLine"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Address</FormLabel>
									<FormControl>
										<Input placeholder="123 Main St" {...field} />
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
										<FormLabel>ZIP</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<DateField control={form.control} name="desiredDate" label="Desired visit date" />

							<TimePreferenceField control={form.control} name="timePreference" />

							<VisitHourField control={form.control} name="visitHour" timePreference={values.timePreference} />
						</div>

						<Separator />

						<FormField
							control={form.control}
							name="customerPhone"
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

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label>Estimated price</Label>
								<Input readOnly prefix={'$'} value={selectedPlan ? estimatedPrice.toFixed(2) : '-'} />
							</div>

							<FormField
								control={form.control}
								name="finalPrice"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Final price (optional)</FormLabel>
										<FormControl>
											<Input
												prefix={'$'}
												type="number"
												step="0.01"
												min="0"
												{...field}
												value={field.value ?? ''}
												onChange={(event) =>
													field.onChange(event.target.value === '' ? undefined : event.target.valueAsNumber)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="adminNotes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Admin notes</FormLabel>
									<FormControl>
										<Textarea placeholder="Write a note for an assigned staff member" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? 'Creating...' : 'Create quote'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
