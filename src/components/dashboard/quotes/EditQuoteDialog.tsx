import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateQuote } from '@/hooks/queries/use-quotes';
import { TIME_PREFERENCE_HOURS, getTimePreferenceForHour } from '@/lib/validation/booking-schema';
import { quoteEditSchema, type QuoteEditValues } from '@/lib/validation/quote-edit-schema';
import type { Tables } from '@/types/supabase';

function toDefaultValues(quote: Tables<'quotes'>): QuoteEditValues {
	const desiredVisit = new Date(quote.desired_visit_date);
	return {
		customerPhone: quote.customer_phone,
		finalPrice: quote.final_price ?? undefined,
		desiredVisitDate: desiredVisit,
		timePreference: getTimePreferenceForHour(desiredVisit.getHours()),
		adminNotes: quote.admin_notes ?? '',
	};
}

export function EditQuoteDialog({
	quote,
	onOpenChange,
}: {
	quote: Tables<'quotes'>;
	onOpenChange: (open: boolean) => void;
}) {
	const updateQuote = useUpdateQuote();

	const form = useForm<QuoteEditValues>({
		resolver: zodResolver(quoteEditSchema),
		defaultValues: toDefaultValues(quote),
	});

	useEffect(() => {
		form.reset(toDefaultValues(quote));
	}, [quote, form]);

	async function onSubmit(values: QuoteEditValues) {
		const desiredVisitDate = new Date(values.desiredVisitDate);
		desiredVisitDate.setHours(TIME_PREFERENCE_HOURS[values.timePreference], 0, 0, 0);

		await updateQuote.mutateAsync({
			id: quote.id,
			updates: {
				customer_phone: values.customerPhone,
				final_price: values.finalPrice ?? null,
				desired_visit_date: desiredVisitDate.toISOString(),
				admin_notes: values.adminNotes || null,
			},
		});
		onOpenChange(false);
	}

	return (
		<Dialog open onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit quote</DialogTitle>
					<DialogDescription>
						{quote.customer_name} &middot; {quote.customer_email}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
						<div className="grid gap-2">
							<Label>Estimated price</Label>
							<Input
								readOnly
								prefix={'$'}
								value={quote.estimated_price != null ? `${quote.estimated_price.toFixed(2)}` : '-'}
							/>
						</div>

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
							<DateField control={form.control} name="desiredVisitDate" label="Desired visit date" />

							<TimePreferenceField control={form.control} name="timePreference" />
						</div>

						<FormField
							control={form.control}
							name="finalPrice"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Final price</FormLabel>
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
								{form.formState.isSubmitting ? 'Saving...' : 'Save'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
