import { format } from 'date-fns';
import type { UseFormReturn } from 'react-hook-form';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar03Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TIME_PREFERENCES, TIME_SLOT_HOURS, type BookingValues } from '@/lib/validation/booking-schema';
import { cn } from '@/lib/utils';

const TIME_PREFERENCE_LABELS: Record<(typeof TIME_PREFERENCES)[number], string> = {
	morning: 'Morning',
	afternoon: 'Afternoon',
	evening: 'Evening',
};

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

			<FormField
				control={form.control}
				name="desiredDate"
				render={({ field }) => (
					<FormItem className="flex flex-col">
						<FormLabel className="w-fit">Desired visit date</FormLabel>
						<Popover>
							<PopoverTrigger asChild>
								<FormControl>
									<Button
										variant="default"
										className={cn(
											'w-full justify-start gap-2 bg-input/30 text-foreground hover:bg-input/50',
											!field.value && 'text-muted-foreground',
										)}
									>
										<HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-4" />
										{field.value ? format(field.value, 'PPP') : 'Pick a date'}
									</Button>
								</FormControl>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									mode="single"
									selected={field.value}
									onSelect={field.onChange}
									disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
								/>
							</PopoverContent>
						</Popover>
						<FormMessage />
					</FormItem>
				)}
			/>

			<div className="grid grid-cols-2 gap-4">
				<FormField
					control={form.control}
					name="timePreference"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="w-fit">Preferred time of day</FormLabel>
							<Select value={field.value} onValueChange={field.onChange}>
								<FormControl>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select a time" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{TIME_PREFERENCES.map((preference) => (
										<SelectItem key={preference} value={preference}>
											{TIME_PREFERENCE_LABELS[preference]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="visitHour"
					render={({ field }) => {
						const timePreference = form.watch('timePreference');
						const availableHours = timePreference ? TIME_SLOT_HOURS[timePreference] : [];

						return (
							<FormItem>
								<FormLabel className="w-fit">Specific hour</FormLabel>
								<Select
									value={field.value !== undefined ? String(field.value) : ''}
									onValueChange={(value) => field.onChange(Number(value))}
									disabled={!timePreference}
								>
									<FormControl>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select an hour" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{availableHours.map((hour) => (
											<SelectItem key={hour} value={String(hour)}>
												{`${String(hour).padStart(2, '0')}:00`}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						);
					}}
				/>
			</div>
		</div>
	);
}
