import { format } from 'date-fns';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar03Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateFieldProps<TFieldValues extends FieldValues> {
	control: Control<TFieldValues>;
	name: FieldPath<TFieldValues>;
	label: string;
	disabledDate?: (date: Date) => boolean;
}

export function DateField<TFieldValues extends FieldValues>({
	control,
	name,
	label,
	disabledDate,
}: DateFieldProps<TFieldValues>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className="flex flex-col">
					<FormLabel className="w-fit">{label}</FormLabel>
					<Popover>
						<PopoverTrigger asChild>
							<FormControl>
								<Button
									type="button"
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
							<Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={disabledDate} />
						</PopoverContent>
					</Popover>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
