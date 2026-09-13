import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUpdatePlan } from '@/hooks/queries/use-plans';
import { planPricingSchema, type PlanPricingValues } from '@/lib/validation/plan-pricing-schema';
import type { Tables } from '@/types/supabase';

function toDefaultValues(plan: Tables<'cleaning_plans'>): PlanPricingValues {
	return {
		basePrice: plan.base_price,
		pricePerBedroom: plan.price_per_bedroom,
		pricePerBathroom: plan.price_per_bathroom,
		pricePerSqft: plan.price_per_sqft,
		petFee: plan.pet_fee,
	};
}

export function PlanPricingForm({ plan }: { plan: Tables<'cleaning_plans'> }) {
	const updatePlan = useUpdatePlan();

	const form = useForm<PlanPricingValues>({
		resolver: zodResolver(planPricingSchema),
		defaultValues: toDefaultValues(plan),
	});

	useEffect(() => {
		form.reset(toDefaultValues(plan));
	}, [plan, form]);

	async function onSubmit(values: PlanPricingValues) {
		try {
			await updatePlan.mutateAsync({
				id: plan.id,
				updates: {
					base_price: values.basePrice,
					price_per_bedroom: values.pricePerBedroom,
					price_per_bathroom: values.pricePerBathroom,
					price_per_sqft: values.pricePerSqft,
					pet_fee: values.petFee,
				},
			});
			toast.success('Pricing updated.');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to update pricing.');
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="basePrice"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Base price</FormLabel>
								<FormControl>
									<Input
										prefix="$"
										type="number"
										step="0.01"
										min="0"
										{...field}
										onChange={(event) => field.onChange(event.target.valueAsNumber)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="petFee"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Pet fee</FormLabel>
								<FormControl>
									<Input
										prefix="$"
										type="number"
										step="0.01"
										min="0"
										{...field}
										onChange={(event) => field.onChange(event.target.valueAsNumber)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="pricePerBedroom"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Price per bedroom</FormLabel>
								<FormControl>
									<Input
										prefix="$"
										type="number"
										step="0.01"
										min="0"
										{...field}
										onChange={(event) => field.onChange(event.target.valueAsNumber)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="pricePerBathroom"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Price per bathroom</FormLabel>
								<FormControl>
									<Input
										prefix="$"
										type="number"
										step="0.01"
										min="0"
										{...field}
										onChange={(event) => field.onChange(event.target.valueAsNumber)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="pricePerSqft"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Price per sqft</FormLabel>
								<FormControl>
									<Input
										prefix="$"
										type="number"
										step="0.0001"
										min="0"
										{...field}
										onChange={(event) => field.onChange(event.target.valueAsNumber)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div>
					<Button type="submit" disabled={form.formState.isSubmitting}>
						{form.formState.isSubmitting ? 'Saving...' : 'Save'}
					</Button>
				</div>
			</form>
		</Form>
	);
}
