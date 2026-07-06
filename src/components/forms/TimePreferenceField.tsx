import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TIME_PREFERENCES, TIME_PREFERENCE_LABELS } from '@/lib/validation/booking-schema';

interface TimePreferenceFieldProps<TFieldValues extends FieldValues> {
	control: Control<TFieldValues>;
	name: FieldPath<TFieldValues>;
	label?: string;
}

export function TimePreferenceField<TFieldValues extends FieldValues>({
	control,
	name,
	label = 'Preferred time of day',
}: TimePreferenceFieldProps<TFieldValues>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel className="w-fit">{label}</FormLabel>
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
	);
}
