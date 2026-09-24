import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TIME_SLOT_HOURS, type TimePreference } from '@/lib/validation/booking-schema';

interface VisitHourFieldProps<TFieldValues extends FieldValues> {
	control: Control<TFieldValues>;
	name: FieldPath<TFieldValues>;
	timePreference: TimePreference | undefined;
	label?: string;
}

export function VisitHourField<TFieldValues extends FieldValues>({
	control,
	name,
	timePreference,
	label = 'Specific hour',
}: VisitHourFieldProps<TFieldValues>) {
	const availableHours = timePreference ? TIME_SLOT_HOURS[timePreference] : [];

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel className="w-fit">{label}</FormLabel>
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
			)}
		/>
	);
}
