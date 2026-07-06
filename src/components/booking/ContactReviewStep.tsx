import { format } from 'date-fns';
import type { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { BookingValues } from '@/lib/validation/booking-schema';
import type { Tables } from '@/types/supabase';

interface ContactReviewStepProps {
	form: UseFormReturn<BookingValues>;
	plan: Tables<'cleaning_plans'> | undefined;
	estimatedPrice: number;
}

export function ContactReviewStep({ form, plan, estimatedPrice }: ContactReviewStepProps) {
	const values = form.watch();

	return (
		<div className="flex flex-col gap-4">
			<FormField
				control={form.control}
				name="fullName"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Full name</FormLabel>
						<FormControl>
							<Input placeholder="Jane Doe" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="email"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Email</FormLabel>
						<FormControl>
							<Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="phone"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Phone</FormLabel>
						<FormControl>
							<Input type="tel" autoComplete="tel" prefix="+1" placeholder="(555) 123-4567" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<div className="flex flex-col gap-1.5 rounded-2xl bg-muted px-4 py-3 text-sm">
				<p className="font-medium text-foreground">Request summary</p>
				<SummaryRow label="Plan" value={plan?.name ?? '—'} />
				<SummaryRow
					label="Home"
					value={`${values.bedrooms} bed · ${values.bathrooms} bath · ${values.squareFootage} sqft${values.hasPets ? ' · has pets' : ''}`}
				/>
				<SummaryRow
					label="Address"
					value={[values.addressLine, values.city, values.state].filter(Boolean).join(', ')}
				/>
				<SummaryRow
					label="Date"
					value={values.desiredDate ? `${format(values.desiredDate, 'PPP')} (${values.timePreference})` : '—'}
				/>
				<SummaryRow label="Estimated price" value={`$${estimatedPrice.toFixed(2)}`} />
			</div>
		</div>
	);
}

function SummaryRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between gap-4">
			<span className="text-muted-foreground">{label}</span>
			<span className="text-right font-medium text-foreground">{value}</span>
		</div>
	);
}
