import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { HugeiconsIcon } from '@hugeicons/react';
import { ChevronLeftIcon, InformationCircleIcon, MapPinIcon } from '@hugeicons/core-free-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import FloatingBubble from '@/components/decorative/FloatingBubble';
import { useAuth } from '@/hooks/auth/use-auth';
import { useGoToBooking } from '@/hooks/booking/use-go-to-booking';
import { useCustomerProfile } from '@/hooks/queries/use-profile';
import { useQuotesByCustomer } from '@/hooks/queries/use-quotes';
import { usePageMeta } from '@/hooks/usePageMeta';
import { cn } from '@/lib/utils';
import { QUOTE_STATUS_BADGE_VARIANT, QUOTE_STATUS_CUSTOMER_MESSAGE, getQuoteStatusFilter } from '@/lib/quote-status';
import type { QuoteWithPlan } from '@/services/quotes';

function formatAddress(quote: QuoteWithPlan) {
	return (
		[quote.address_line, quote.city, quote.state].filter(Boolean).join(', ') +
		(quote.zip_code ? ` ${quote.zip_code}` : '')
	);
}

function formatPrice(quote: QuoteWithPlan) {
	const value = quote.final_price ?? quote.estimated_price;
	return value != null ? `$${value.toFixed(2)}` : 'Pending review';
}

function buildRebookUrl(quote: QuoteWithPlan) {
	const params = new URLSearchParams({
		planId: quote.plan_id,
		addressLine: quote.address_line,
	});
	if (quote.city) params.set('city', quote.city);
	if (quote.state) params.set('state', quote.state);
	if (quote.zip_code) params.set('zipCode', quote.zip_code);

	if (quote.service_description) {
		params.set('serviceDescription', quote.service_description);
		return `/booking?${params.toString()}`;
	}

	if (quote.bedrooms != null && quote.bathrooms != null && quote.square_footage != null) {
		params.set('bedrooms', String(quote.bedrooms));
		params.set('bathrooms', String(quote.bathrooms));
		params.set('squareFootage', String(quote.square_footage));
		params.set('hasPets', String(quote.has_pets));
	}

	return `/booking?${params.toString()}`;
}

function QuoteCardSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-5 w-32" />
				<Skeleton className="h-3 w-40" />
				<CardAction>
					<Skeleton className="h-5 w-16 rounded-full" />
				</CardAction>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="grid grid-cols-2 gap-4 border-y border-input py-4">
					<div className="flex flex-col gap-1.5">
						<Skeleton className="h-3 w-24" />
						<Skeleton className="h-4 w-28" />
					</div>
					<div className="flex flex-col gap-1.5">
						<Skeleton className="h-3 w-16" />
						<Skeleton className="h-4 w-20" />
					</div>
				</div>
				<Skeleton className="h-4 w-3/4" />
			</CardContent>
		</Card>
	);
}

export default function DashboardMyQuotesPage() {
	usePageMeta({
		title: 'My Quotes | Alianci Cleaning',
		path: '/dashboard/my-quotes',
		noIndex: true,
	});

	const { user } = useAuth();
	const { data: profile, isLoading: isProfileLoading, isError: isProfileError } = useCustomerProfile(user?.id);
	const { data: quotes, isLoading: isQuotesLoading, isError: isQuotesError } = useQuotesByCustomer(profile?.id);
	const isLoading = isProfileLoading || isQuotesLoading;
	const isError = isProfileError || isQuotesError;
	const goToBooking = useGoToBooking();
	const navigate = useNavigate();

	return (
		<div className="min-h-dvh bg-background">
			<div className="relative overflow-hidden bg-linear-to-br from-baltic-blue via-fresh-sky to-pale-sky px-6 pt-14 pb-20 lg:px-12">
				<FloatingBubble size={160} color="#ffffff" opacity={0.1} top="-50px" left="8%" animationDuration="7s" />
				<FloatingBubble
					size={70}
					color="#cde2d7"
					opacity={0.18}
					top="40px"
					right="18%"
					animationDelay="1.2s"
					animationDuration="6s"
				/>
				<FloatingBubble
					size={40}
					color="#ffffff"
					variant="outline"
					opacity={0.2}
					bottom="-10px"
					right="30%"
					animationDelay="2s"
					animationDuration="8s"
				/>
				<FloatingBubble
					size={110}
					color="#5bb286"
					opacity={0.12}
					bottom="-40px"
					left="30%"
					animationDelay="0.6s"
					animationDuration="9s"
				/>

				<div className="relative mx-auto max-w-3xl">
					<Link
						className={cn(
							'mb-7 border-white/30 bg-white/15 text-white backdrop-blur-md hover:bg-white/25 hover:text-white',
							buttonVariants({ variant: 'outline', size: 'sm' }),
						)}
						to="/"
					>
						<HugeiconsIcon icon={ChevronLeftIcon} className="size-4" />
						Go Home
					</Link>
					<h1 className="mb-2.5 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">My Quotes</h1>
					<p className="max-w-md text-[15px] leading-relaxed text-white/85">
						Track the status of every cleaning quote you&apos;ve requested, from first review to final confirmation.
					</p>
				</div>
			</div>

			<div className="px-6 lg:px-12">
				<div className="relative z-10 mx-auto -mt-10 max-w-3xl pb-16">
					{isLoading && (
						<div className="flex flex-col gap-5">
							<QuoteCardSkeleton />
							<QuoteCardSkeleton />
							<QuoteCardSkeleton />
						</div>
					)}
					{isError && <p className="text-sm text-destructive">Failed to load quotes.</p>}
					{!isLoading && !isError && !quotes?.length && (
						<Card className="items-start gap-3 px-6 py-8">
							<p className="text-sm text-muted-foreground">No quotes yet. Book a cleaning to get started.</p>
							<Button variant="gradient" size="sm" onClick={() => goToBooking()}>
								Book Now
							</Button>
						</Card>
					)}

					{!isLoading && !isError && quotes && quotes.length > 0 && (
						<div className="flex flex-col gap-5">
							{quotes.map((quote) => {
								const statusFilter = getQuoteStatusFilter(quote);
								return (
									<Card key={quote.id} className="shadow-lg shadow-baltic-blue/10">
										<CardHeader>
											<CardTitle className="text-lg">{quote.cleaning_plans?.name ?? 'Custom plan'}</CardTitle>
											<p className="text-xs text-muted-foreground">
												Submitted {new Date(quote.created_at).toLocaleDateString()}
											</p>
											<CardAction>
												<Badge variant={QUOTE_STATUS_BADGE_VARIANT[statusFilter]} className="capitalize">
													{statusFilter}
												</Badge>
											</CardAction>
										</CardHeader>
										<CardContent className="flex flex-col gap-4">
											<div className="grid grid-cols-2 gap-4 border-y border-input py-4">
												<div>
													<p className="mb-1 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
														Desired visit
													</p>
													<p className="text-sm font-semibold text-foreground">
														{format(new Date(quote.desired_visit_date), 'M/d/yyyy h:mm a')}
													</p>
												</div>
												<div>
													<p className="mb-1 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
														Price
													</p>
													<p className="text-sm font-semibold text-foreground">{formatPrice(quote)}</p>
												</div>
											</div>

											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<HugeiconsIcon icon={MapPinIcon} className="size-4 text-fresh-sky" />
												{formatAddress(quote)}
											</div>

											{quote.admin_notes && (
												<div className="flex gap-2.5 rounded-xl border border-honeydew bg-honeydew/40 px-3.5 py-3">
													<HugeiconsIcon
														icon={InformationCircleIcon}
														className="mt-0.5 size-4 shrink-0 text-mint-leaf"
													/>
													<p className="text-sm leading-relaxed text-foreground">
														<span className="font-semibold">Note from our team: </span>
														{quote.admin_notes}
													</p>
												</div>
											)}

											<div className="flex gap-2.5 rounded-xl border border-input bg-muted/40 px-3.5 py-3">
												<HugeiconsIcon icon={InformationCircleIcon} className="mt-0.5 size-4 shrink-0 text-fresh-sky" />
												<p className="text-sm leading-relaxed text-muted-foreground">
													{QUOTE_STATUS_CUSTOMER_MESSAGE[statusFilter]}
												</p>
											</div>

											<Button
												variant="outline"
												size="sm"
												className="self-start"
												onClick={() => navigate(buildRebookUrl(quote))}
											>
												Book Again
											</Button>
										</CardContent>
									</Card>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
