import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAcceptQuoteByConfirmationToken, useQuoteByConfirmationToken } from '@/hooks/queries/use-quotes';

export default function ConfirmationPage() {
	const { token } = useParams<{ token: string }>();
	const { data: quote, isLoading, isError } = useQuoteByConfirmationToken(token);
	const acceptQuote = useAcceptQuoteByConfirmationToken();
	const hasRequestedAccept = useRef(false);

	useEffect(() => {
		if (!token || !quote || quote.status === 'accepted' || hasRequestedAccept.current) return;
		hasRequestedAccept.current = true;
		acceptQuote.mutate(token);
	}, [token, quote, acceptQuote]);

	return (
		<div className="flex min-h-dvh items-center justify-center bg-background px-6 py-10">
			<Card className="w-full max-w-md">
				<CardContent className="flex flex-col items-center gap-3 py-6 text-center">
					{isLoading && <p className="text-sm text-muted-foreground">Loading your confirmation...</p>}

					{!isLoading && (isError || !quote) && (
						<>
							<h1 className="text-xl font-bold text-foreground">Confirmation not found</h1>
							<p className="max-w-sm text-sm text-muted-foreground">
								This confirmation link is invalid or has expired. Please contact us if you believe this is a mistake.
							</p>
						</>
					)}

					{!isLoading && quote && (
						<>
							<HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-12 text-mint-leaf" />
							<h1 className="text-xl font-bold text-foreground">Your service is confirmed</h1>
							<p className="max-w-sm text-sm text-muted-foreground">
								Thanks, {quote.customer_name}! We look forward to seeing you.
							</p>

							<div className="mt-2 w-full rounded-lg border border-input p-4 text-left text-sm">
								<div className="flex justify-between py-1">
									<span className="text-muted-foreground">Visit date</span>
									<span className="font-medium text-foreground">
										{new Date(quote.desired_visit_date).toLocaleDateString()}
									</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-muted-foreground">Address</span>
									<span className="font-medium text-foreground">{quote.address_line}</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-muted-foreground">Final price</span>
									<span className="font-medium text-foreground">
										{quote.final_price != null ? `$${quote.final_price.toFixed(2)}` : '-'}
									</span>
								</div>
							</div>
						</>
					)}

					<Button asChild variant="gradient" size="lg" className="mt-2">
						<Link to="/">Go home</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
