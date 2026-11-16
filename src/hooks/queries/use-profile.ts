import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileKeys } from '@/lib/query-keys';
import type { TablesInsert, TablesUpdate } from '@/types/supabase';

const loadProfilesService = () => import('@/services/profiles');

export function useStaffProfile(userId: string | undefined) {
	return useQuery({
		queryKey: profileKeys.staff(userId ?? ''),
		queryFn: async () => (await loadProfilesService()).getStaffProfile(userId!),
		enabled: !!userId,
	});
}

export function useStaffProfiles() {
	return useQuery({
		queryKey: profileKeys.staffList(),
		queryFn: async () => (await loadProfilesService()).getStaffProfiles(),
	});
}

export function useStaffNames() {
	const { data } = useStaffProfiles();

	return useMemo(() => new Map((data ?? []).map((member) => [member.id, member.full_name])), [data]);
}

export function useCustomerProfile(userId: string | undefined) {
	return useQuery({
		queryKey: profileKeys.customer(userId ?? ''),
		queryFn: async () => {
			const { claimCustomerProfile, getCustomerProfile } = await loadProfilesService();
			return (await claimCustomerProfile()) ?? getCustomerProfile(userId!);
		},
		enabled: !!userId,
	});
}

export function useUpdateCustomerProfile(userId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (updates: TablesUpdate<'customer_profiles'>) =>
			(await loadProfilesService()).updateCustomerProfile(userId, updates),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: profileKeys.customer(userId) });
		},
	});
}

export function useUpsertCustomerProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (profile: TablesInsert<'customer_profiles'>) =>
			(await loadProfilesService()).upsertCustomerProfile(profile),
		onSuccess: (data) => {
			if (data.user_id) {
				queryClient.invalidateQueries({ queryKey: profileKeys.customer(data.user_id) });
			}
		},
	});
}
