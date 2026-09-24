import type { UseFormReturn } from 'react-hook-form';
import { DateField } from '@/components/forms/DateField';
import { TimePreferenceField } from '@/components/forms/TimePreferenceField';
import { VisitHourField } from '@/components/forms/VisitHourField';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { BookingValues } from '@/lib/validation/booking-schema';

interface AddressAndDateStepProps {
	form: UseFormReturn<BookingValues>;
}

export function AddressAndDateStep({ form }: AddressAndDateStepProps) {
	return (
		<div className="flex flex-col gap-4">
			<FormField
				control={form.control}
				name="addressLine"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="w-fit">Address</FormLabel>
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
							<FormLabel className="w-fit">City</FormLabel>
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
							<FormLabel className="w-fit">State</FormLabel>
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
							<FormLabel className="w-fit">ZIP</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>

			<DateField
				control={form.control}
				name="desiredDate"
				label="Desired visit date"
				disabledDate={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
			/>

			<div className="grid grid-cols-2 gap-4">
				<TimePreferenceField control={form.control} name="timePreference" />

				<VisitHourField control={form.control} name="visitHour" timePreference={form.watch('timePreference')} />
			</div>
		</div>
	);
}
