import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileKeys } from '@/lib/query-keys';
import {
	getCustomerProfile,
	getStaffProfile,
	getStaffProfiles,
	updateCustomerProfile,
	upsertCustomerProfile,
} from '@/services/profiles';
import type { TablesInsert, TablesUpdate } from '@/types/supabase';

export function useStaffProfile(userId: string | undefined) {
	return useQuery({
		queryKey: profileKeys.staff(userId ?? ''),
		queryFn: () => getStaffProfile(userId!),
		enabled: !!userId,
	});
}

export function useStaffProfiles() {
	return useQuery({
		queryKey: profileKeys.staffList(),
		queryFn: () => getStaffProfiles(),
	});
}

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

export function useUpsertCustomerProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (profile: TablesInsert<'customer_profiles'>) => upsertCustomerProfile(profile),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: profileKeys.customer(data.id) });
		},
	});
}
