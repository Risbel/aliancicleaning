import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { planKeys } from '@/lib/query-keys';
import { getActivePlans, getAllPlans, updatePlan } from '@/services/plans';
import type { TablesUpdate } from '@/types/supabase';

export function usePlans() {
	return useQuery({
		queryKey: planKeys.lists(),
		queryFn: getActivePlans,
		staleTime: 5 * 60 * 1000,
	});
}

export function useAllPlans() {
	return useQuery({
		queryKey: planKeys.adminList(),
		queryFn: getAllPlans,
	});
}

export function useUpdatePlan() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'cleaning_plans'> }) => updatePlan(id, updates),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: planKeys.lists() });
			queryClient.invalidateQueries({ queryKey: planKeys.adminList() });
		},
	});
}
