import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quoteKeys } from '@/lib/query-keys';
import {
	acceptQuoteByConfirmationToken,
	createQuote,
	deleteQuote,
	getQuote,
	getQuoteByConfirmationToken,
	getQuotes,
	getQuotesByCustomer,
	updateQuote,
	type QuoteStatusFilter,
} from '@/services/quotes';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase';

export function useQuotes(filter: { status: QuoteStatusFilter; search?: string; assignedTo?: string }) {
	return useQuery({
		queryKey: quoteKeys.byFilter(filter),
		queryFn: () => getQuotes(filter),
	});
}

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

export function useUpdateQuote() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'quotes'> }) => updateQuote(id, updates),
		onMutate: async ({ id, updates }) => {
			await queryClient.cancelQueries({ queryKey: quoteKeys.lists() });

			const previous = queryClient.getQueriesData<Tables<'quotes'>[]>({ queryKey: quoteKeys.lists() });

			queryClient.setQueriesData<Tables<'quotes'>[]>({ queryKey: quoteKeys.lists() }, (old) =>
				old?.map((quote) => (quote.id === id ? { ...quote, ...updates } : quote)),
			);

			return { previous };
		},
		onError: (_error, _variables, context) => {
			context?.previous.forEach(([queryKey, data]) => {
				queryClient.setQueryData(queryKey, data);
			});
		},
		onSettled: (data) => {
			queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
			if (data) queryClient.invalidateQueries({ queryKey: quoteKeys.detail(data.id) });
		},
	});
}

export function useDeleteQuote() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteQuote(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
		},
	});
}

export function useQuoteByConfirmationToken(token: string | undefined) {
	return useQuery({
		queryKey: quoteKeys.byConfirmationToken(token ?? ''),
		queryFn: () => getQuoteByConfirmationToken(token!),
		enabled: !!token,
	});
}

export function useAcceptQuoteByConfirmationToken() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (token: string) => acceptQuoteByConfirmationToken(token),
		onSuccess: (data, token) => {
			queryClient.setQueryData(quoteKeys.byConfirmationToken(token), data);
		},
	});
}
