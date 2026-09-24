import type { UseFormReturn } from 'react-hook-form';
import { CustomerNoteField } from '@/components/booking/CustomerNoteField';
import { PhotoAttachmentsField } from '@/components/booking/PhotoAttachmentsField';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { PendingQuotePhoto } from '@/lib/booking/photo-compression';
import type { BookingValues } from '@/lib/validation/booking-schema';
import type { Tables } from '@/types/supabase';

interface PlanAndDetailsStepProps {
	form: UseFormReturn<BookingValues>;
	plans: Tables<'cleaning_plans'>[];
	isCustom: boolean;
	photos: PendingQuotePhoto[];
	isCompressing: boolean;
	onAddFiles: (files: File[]) => void;
	onRemovePhoto: (id: string) => void;
}

export function PlanAndDetailsStep({
	form,
	plans,
	isCustom,
	photos,
	isCompressing,
	onAddFiles,
	onRemovePhoto,
}: PlanAndDetailsStepProps) {
	return (
		<div className="flex flex-col gap-4">
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
								{plans.map((plan) => (
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

			{!isCustom && (
				<>
					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="bedrooms"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Bedrooms</FormLabel>
									<FormControl>
										<Input type="number" min={0} step={1} {...field} value={field.value ?? ''} />
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
										<Input type="number" min={0} step={1} {...field} value={field.value ?? ''} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="squareFootage"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Square footage</FormLabel>
								<FormControl>
									<Input type="number" min={1} step={1} placeholder="e.g. 1200" {...field} value={field.value ?? ''} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="hasPets"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between rounded-2xl border border-input px-4 py-3">
								<FormLabel className="flex-1 cursor-pointer">I have pets at home</FormLabel>
								<FormControl>
									<Switch checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
							</FormItem>
						)}
					/>
				</>
			)}

			<CustomerNoteField form={form} isCustom={isCustom} />

			<PhotoAttachmentsField
				photos={photos}
				isCompressing={isCompressing}
				onAddFiles={onAddFiles}
				onRemovePhoto={onRemovePhoto}
			/>
		</div>
	);
}
