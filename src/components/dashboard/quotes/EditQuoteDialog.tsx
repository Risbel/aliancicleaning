import { useEffect, useRef } from 'react';
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
import { VisitHourField } from '@/components/forms/VisitHourField';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAllPlans } from '@/hooks/queries/use-plans';
import { useUpdateQuote } from '@/hooks/queries/use-quotes';
import { QUOTE_DURATION_OPTIONS, estimateQuoteDurationMinutes, formatDurationMinutes } from '@/lib/quote-duration';
import { TIME_PREFERENCE_HOURS, TIME_SLOT_HOURS, getTimePreferenceForHour } from '@/lib/validation/booking-schema';
import { quoteEditSchema, type QuoteEditValues } from '@/lib/validation/quote-edit-schema';
import type { Tables } from '@/types/supabase';

const ESTIMATE_OPTION = 'estimate';

function toDefaultValues(quote: Tables<'quotes'>): QuoteEditValues {
	const desiredVisit = new Date(quote.desired_visit_date);
	return {
		customerPhone: quote.customer_phone,
		finalPrice: quote.final_price ?? undefined,
		desiredVisitDate: desiredVisit,
		timePreference: getTimePreferenceForHour(desiredVisit.getHours()),
		visitHour: desiredVisit.getHours(),
		durationMinutes: quote.duration_minutes ?? undefined,
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
	const { data: plans } = useAllPlans();
	const planType = plans?.find((plan) => plan.id === quote.plan_id)?.type ?? null;
	const estimatedDuration = estimateQuoteDurationMinutes(quote, planType);

	const form = useForm<QuoteEditValues>({
		resolver: zodResolver(quoteEditSchema),
		defaultValues: toDefaultValues(quote),
	});

	const timePreference = form.watch('timePreference');
	const previousTimePreference = useRef(timePreference);

	useEffect(() => {
		const defaults = toDefaultValues(quote);
		previousTimePreference.current = defaults.timePreference;
		form.reset(defaults);
	}, [quote, form]);

	useEffect(() => {
		if (previousTimePreference.current === timePreference) return;
		previousTimePreference.current = timePreference;
		form.setValue('visitHour', TIME_SLOT_HOURS[timePreference][0]);
	}, [timePreference, form]);

	async function onSubmit(values: QuoteEditValues) {
		const desiredVisitDate = new Date(values.desiredVisitDate);
		desiredVisitDate.setHours(values.visitHour ?? TIME_PREFERENCE_HOURS[values.timePreference], 0, 0, 0);

		await updateQuote.mutateAsync({
			id: quote.id,
			updates: {
				customer_phone: values.customerPhone,
				final_price: values.finalPrice ?? null,
				desired_visit_date: desiredVisitDate.toISOString(),
				duration_minutes: values.durationMinutes ?? null,
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

							<VisitHourField control={form.control} name="visitHour" timePreference={timePreference} />

							<FormField
								control={form.control}
								name="durationMinutes"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="w-fit">Duration</FormLabel>
										<Select
											value={field.value != null ? String(field.value) : ESTIMATE_OPTION}
											onValueChange={(value) => field.onChange(value === ESTIMATE_OPTION ? undefined : Number(value))}
										>
											<FormControl>
												<SelectTrigger className="w-full">
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value={ESTIMATE_OPTION}>
													Estimated &middot; {formatDurationMinutes(estimatedDuration)}
												</SelectItem>
												{QUOTE_DURATION_OPTIONS.map((minutes) => (
													<SelectItem key={minutes} value={String(minutes)}>
														{formatDurationMinutes(minutes)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
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
