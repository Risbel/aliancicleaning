interface BookingSummaryProps {
	planName: string | undefined;
	estimatedPrice: number | null;
}

export function BookingSummary({ planName, estimatedPrice }: BookingSummaryProps) {
	return (
		<div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3">
			<div>
				<p className="text-sm font-medium text-foreground">{planName ?? 'Select a plan'}</p>
				<p className="text-xs text-muted-foreground">{estimatedPrice != null ? 'Estimated price' : 'Price'}</p>
			</div>
			{estimatedPrice != null ? (
				<p className="text-xl font-bold text-foreground">${estimatedPrice.toFixed(2)}</p>
			) : (
				<p className="text-sm font-semibold text-foreground">Pending review</p>
			)}
		</div>
	);
}
