import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, ArrowUp01Icon, Delete02Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useUpdatePlan } from '@/hooks/queries/use-plans';
import { planContentSchema, type PlanContentValues } from '@/lib/validation/plan-content-schema';
import type { Tables } from '@/types/supabase';

const DEFAULT_IMAGE_BG = '#cbe0ea';

function toDefaultValues(plan: Tables<'cleaning_plans'>): PlanContentValues {
	return {
		name: plan.name,
		description: plan.description ?? '',
		features: plan.features.map((value) => ({ value })),
		ctaLabel: plan.cta_label,
		imageBg: plan.image_bg ?? DEFAULT_IMAGE_BG,
		isPopular: plan.is_popular,
		isActive: plan.is_active,
		sortOrder: plan.sort_order,
	};
}

function toErrorMessage(error: unknown): string {
	const message = error instanceof Error ? error.message : '';

	if (message.includes('cleaning_plans_single_popular_idx')) {
		return 'Another plan is already marked as Most Popular. Turn it off there first.';
	}

	return message || 'Failed to update plan.';
}

export function PlanContentForm({ plan }: { plan: Tables<'cleaning_plans'> }) {
	const updatePlan = useUpdatePlan();

	const form = useForm<PlanContentValues>({
		resolver: zodResolver(planContentSchema),
		defaultValues: toDefaultValues(plan),
	});

	const features = useFieldArray({ control: form.control, name: 'features' });

	useEffect(() => {
		form.reset(toDefaultValues(plan));
	}, [plan, form]);

	async function onSubmit(values: PlanContentValues) {
		try {
			await updatePlan.mutateAsync({
				id: plan.id,
				updates: {
					name: values.name.trim(),
					description: values.description.trim() || null,
					features: values.features.map((feature) => feature.value.trim()),
					cta_label: values.ctaLabel.trim(),
					image_bg: values.imageBg,
					is_popular: values.isPopular,
					is_active: values.isActive,
					sort_order: values.sortOrder,
				},
			});
			toast.success('Plan updated.');
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tagline</FormLabel>
							<FormControl>
								<Textarea rows={3} {...field} />
							</FormControl>
							<FormDescription>Short pitch under the plan name on the landing page.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormItem>
					<FormLabel>Features</FormLabel>
					<div className="flex flex-col gap-2">
						{features.fields.map((item, index) => (
							<FormField
								key={item.id}
								control={form.control}
								name={`features.${index}.value`}
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center gap-1.5">
											<FormControl>
												<Input {...field} />
											</FormControl>
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												disabled={index === 0}
												onClick={() => features.move(index, index - 1)}
												aria-label="Move feature up"
											>
												<HugeiconsIcon icon={ArrowUp01Icon} className="size-4" />
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												disabled={index === features.fields.length - 1}
												onClick={() => features.move(index, index + 1)}
												aria-label="Move feature down"
											>
												<HugeiconsIcon icon={ArrowDown01Icon} className="size-4" />
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												onClick={() => features.remove(index)}
												aria-label="Remove feature"
											>
												<HugeiconsIcon icon={Delete02Icon} className="size-4 text-destructive" />
											</Button>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						))}

						{features.fields.length === 0 && (
							<p className="text-sm text-muted-foreground">No features yet.</p>
						)}

						<div>
							<Button type="button" variant="outline" size="sm" onClick={() => features.append({ value: '' })}>
								<HugeiconsIcon icon={PlusSignIcon} className="size-4" />
								Add feature
							</Button>
						</div>
					</div>
				</FormItem>

				<div className="grid gap-4 sm:grid-cols-2">
					<FormField
						control={form.control}
						name="ctaLabel"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Button label</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="sortOrder"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Display order</FormLabel>
								<FormControl>
									<Input
										type="number"
										step="1"
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

				<FormField
					control={form.control}
					name="imageBg"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Image background</FormLabel>
							<div className="flex items-center gap-2">
								<FormControl>
									<Input
										type="color"
										value={field.value}
										onChange={field.onChange}
										className="h-9 w-14 shrink-0 cursor-pointer rounded-xl p-1"
										aria-label="Pick image background color"
									/>
								</FormControl>
								<Input value={field.value} onChange={field.onChange} className="font-mono" />
							</div>
							<FormDescription>Fills the card behind the plan image.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="isPopular"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center justify-between rounded-lg border border-input p-4">
							<div className="flex flex-col gap-1">
								<FormLabel>Most Popular</FormLabel>
								<FormDescription>Highlights this plan on the landing page. Only one plan at a time.</FormDescription>
							</div>
							<FormControl>
								<Switch checked={field.value} onCheckedChange={field.onChange} />
							</FormControl>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="isActive"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center justify-between rounded-lg border border-input p-4">
							<div className="flex flex-col gap-1">
								<FormLabel>Active</FormLabel>
								<FormDescription>Inactive plans are hidden from the landing page and the booking form.</FormDescription>
							</div>
							<FormControl>
								<Switch checked={field.value} onCheckedChange={field.onChange} />
							</FormControl>
						</FormItem>
					)}
				/>

				<div>
					<Button type="submit" disabled={form.formState.isSubmitting}>
						{form.formState.isSubmitting ? 'Saving...' : 'Save'}
					</Button>
				</div>
			</form>
		</Form>
	);
}
