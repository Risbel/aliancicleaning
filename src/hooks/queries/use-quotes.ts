import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quoteKeys } from '@/lib/query-keys';
import { createQuote, getQuote, getQuotesByCustomer } from '@/services/quotes';
import type { TablesInsert } from '@/types/supabase';

export function useQuotesByCustomer(customerId: string | undefined) {
	return useQuery({
		queryKey: quoteKeys.listByCustomer(customerId ?? ''),
		queryFn: () => getQuotesByCustomer(customerId!),
		enabled: !!customerId,
	});
}

export function useQuote(id: string | undefined) {
	return useQuery({
		queryKey: quoteKeys.detail(id ?? ''),
		queryFn: () => getQuote(id!),
		enabled: !!id,
	});
}

export function useCreateQuote() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (quote: TablesInsert<'quotes'>) => createQuote(quote),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
			if (data.customer_id) {
				queryClient.invalidateQueries({ queryKey: quoteKeys.listByCustomer(data.customer_id) });
			}
		},
	});
}
