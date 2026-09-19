import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerKeys, profileKeys, quoteKeys } from '@/lib/query-keys';
import {
	createCustomer,
	getAccountCustomers,
	getCustomer,
	getCustomers,
	mergeCustomers,
	updateCustomer,
	type CustomerTypeFilter,
} from '@/services/customers';
import type { TablesInsert, TablesUpdate } from '@/types/supabase';

export function useCustomers(filter: { type: CustomerTypeFilter; search?: string }) {
	return useQuery({
		queryKey: customerKeys.byFilter(filter),
		queryFn: () => getCustomers(filter),
	});
}

export function useAccountCustomers() {
	return useQuery({
		queryKey: customerKeys.accounts(),
		queryFn: () => getAccountCustomers(),
	});
}

export function useCustomer(id: string | undefined) {
	return useQuery({
		queryKey: customerKeys.detail(id ?? ''),
		queryFn: () => getCustomer(id!),
		enabled: !!id,
	});
}

export function useCreateCustomer() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (customer: TablesInsert<'customer_profiles'>) => createCustomer(customer),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
		},
	});
}

export function useUpdateCustomer() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'customer_profiles'> }) =>
			updateCustomer(id, updates),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
			queryClient.invalidateQueries({ queryKey: customerKeys.detail(data.id) });
			if (data.user_id) {
				queryClient.invalidateQueries({ queryKey: profileKeys.customer(data.user_id) });
			}
		},
	});
}

export function useMergeCustomers() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ sourceId, targetId }: { sourceId: string; targetId: string }) => mergeCustomers(sourceId, targetId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: customerKeys.all });
			queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
			queryClient.invalidateQueries({ queryKey: profileKeys.all });
		},
	});
}
