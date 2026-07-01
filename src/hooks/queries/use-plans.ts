import { useQuery } from '@tanstack/react-query';
import { planKeys } from '@/lib/query-keys';
import { getActivePlans } from '@/services/plans';

export function usePlans() {
	return useQuery({
		queryKey: planKeys.lists(),
		queryFn: getActivePlans,
		staleTime: 5 * 60 * 1000,
	});
}
