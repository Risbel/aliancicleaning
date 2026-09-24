import type { UseFormReturn } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import type { BookingValues } from '@/lib/validation/booking-schema';

interface CustomerNoteFieldProps {
	form: UseFormReturn<BookingValues>;
	isCustom: boolean;
}

export function CustomerNoteField({ form, isCustom }: CustomerNoteFieldProps) {
	return (
		<FormField
			control={form.control}
			name="customer_note"
			render={({ field }) => (
				<FormItem>
					<FormLabel>
						{isCustom ? (
							'Describe the service you need'
						) : (
							<>
								Note <span className="font-normal text-muted-foreground">(optional)</span>
							</>
						)}
					</FormLabel>
					<FormControl>
						<Textarea
							rows={isCustom ? 5 : 3}
							placeholder={
								isCustom
									? 'For example: post-renovation cleanup of a two-car garage, including dust removal from shelves and pressure washing the floor.'
									: 'Additional notes, clarifications, or comments.'
							}
							{...field}
							value={field.value ?? ''}
						/>
					</FormControl>
					{isCustom && (
						<FormDescription>
							The more detail you give us, the more accurate the price we send back will be.
						</FormDescription>
					)}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
