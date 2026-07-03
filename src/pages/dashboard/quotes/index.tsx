import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { HugeiconsIcon } from '@hugeicons/react';
import { ChevronLeftIcon } from '@hugeicons/core-free-icons';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useQuotes } from '@/hooks/queries/use-quotes';
import { cn } from '@/lib/utils';
import { QUOTE_FILTER_TAGS, QUOTE_STATUS_BADGE_VARIANT } from '@/lib/quote-status';
import type { QuoteStatusFilter } from '@/services/quotes';
import type { Tables } from '@/types/supabase';
import { buttonVariants } from '@/components/ui/button-variants';

function displayStatus(quote: Tables<'quotes'>): QuoteStatusFilter {
	if (quote.status === 'pending' && new Date(quote.desired_visit_date) < new Date()) return 'expired';
	return quote.status;
}

export default function DashboardQuotesPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const status = (searchParams.get('status') as QuoteStatusFilter) || 'pending';
	const search = searchParams.get('q') ?? '';

	const [searchInput, setSearchInput] = useState(search);
	const { data: quotes, isLoading, isError } = useQuotes({ status, search: search || undefined });

	function setStatus(nextStatus: QuoteStatusFilter) {
		setSearchParams((params) => {
			if (nextStatus === 'pending') params.delete('status');
			else params.set('status', nextStatus);
			return params;
		});
	}

	const debouncedSetSearch = useDebouncedCallback((value: string) => {
		setSearchParams((params) => {
			if (value) params.set('q', value);
			else params.delete('q');
			return params;
		});
	}, 400);

	function handleSearchChange(value: string) {
		setSearchInput(value);
		debouncedSetSearch(value);
	}

	return (
		<div className="min-h-dvh bg-background px-6 py-10 lg:px-12">
			<Link className={cn('mb-6 absolute top-2 left-2', buttonVariants({ variant: 'ghost', size: 'sm' }))} to="/">
				<HugeiconsIcon icon={ChevronLeftIcon} className="size-5" />
				Go Home
			</Link>
			<div className="mx-auto max-w-6xl">
				<h1 className="mb-6 text-2xl font-bold text-foreground">Quotes</h1>

				<div className="mb-4 flex flex-wrap gap-2">
					{QUOTE_FILTER_TAGS.map((tag) => (
						<button key={tag.value} type="button" onClick={() => setStatus(tag.value)}>
							<Badge
								variant={status === tag.value ? QUOTE_STATUS_BADGE_VARIANT[tag.value] : 'outline'}
								className={cn(status === tag.value && 'ring-2 ring-ring/30')}
							>
								{tag.label}
							</Badge>
						</button>
					))}
				</div>

				<Input
					value={searchInput}
					onChange={(event) => handleSearchChange(event.target.value)}
					placeholder="Search by name or email"
					className="mb-6 max-w-sm"
				/>

				{isLoading && <p className="text-sm text-muted-foreground">Loading quotes...</p>}
				{isError && <p className="text-sm text-destructive">Failed to load quotes.</p>}
				{!isLoading && !isError && quotes?.length === 0 && (
					<p className="text-sm text-muted-foreground">No quotes found.</p>
				)}

				{!isLoading && !isError && quotes && quotes.length > 0 && (
					<div className="overflow-x-auto rounded-lg border border-input">
						<table className="w-full text-left text-sm">
							<thead className="border-b border-input bg-muted/40">
								<tr>
									<th className="px-4 py-3 font-semibold">Customer</th>
									<th className="px-4 py-3 font-semibold">Email</th>
									<th className="px-4 py-3 font-semibold">Phone</th>
									<th className="px-4 py-3 font-semibold">Desired visit</th>
									<th className="px-4 py-3 font-semibold">Estimated price</th>
									<th className="px-4 py-3 font-semibold">Status</th>
									<th className="px-4 py-3 font-semibold">Created</th>
								</tr>
							</thead>
							<tbody>
								{quotes.map((quote) => (
									<tr key={quote.id} className="border-b border-input last:border-0">
										<td className="px-4 py-3">{quote.customer_name}</td>
										<td className="px-4 py-3">{quote.customer_email}</td>
										<td className="px-4 py-3">{quote.customer_phone}</td>
										<td className="px-4 py-3">{new Date(quote.desired_visit_date).toLocaleDateString()}</td>
										<td className="px-4 py-3">
											{quote.estimated_price != null ? `$${quote.estimated_price.toFixed(2)}` : '-'}
										</td>
										<td className="px-4 py-3">
											<Badge variant={QUOTE_STATUS_BADGE_VARIANT[displayStatus(quote)]}>{displayStatus(quote)}</Badge>
										</td>
										<td className="px-4 py-3">{new Date(quote.created_at).toLocaleDateString()}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
