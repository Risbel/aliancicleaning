import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileKeys } from '@/lib/query-keys';
import { getCustomerProfile, updateCustomerProfile } from '@/services/profiles';
import type { TablesUpdate } from '@/types/supabase';

export function useCustomerProfile(userId: string | undefined) {
	return useQuery({
		queryKey: profileKeys.customer(userId ?? ''),
		queryFn: () => getCustomerProfile(userId!),
		enabled: !!userId,
	});
}

export function useUpdateCustomerProfile(userId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (updates: TablesUpdate<'customer_profiles'>) => updateCustomerProfile(userId, updates),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: profileKeys.customer(userId) });
		},
	});
}
