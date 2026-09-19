import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileKeys, quoteKeys, staffKeys } from '@/lib/query-keys';
import {
	addStaffMember,
	findUserByEmail,
	getStaffMembers,
	removeStaffMember,
	setStaffRole,
	type StaffRole,
} from '@/services/staff';

export function useStaffMembers() {
	return useQuery({
		queryKey: staffKeys.lists(),
		queryFn: () => getStaffMembers(),
	});
}

export function useFindUserByEmail(email: string | undefined) {
	return useQuery({
		queryKey: staffKeys.lookup(email ?? ''),
		queryFn: () => findUserByEmail(email!),
		enabled: !!email,
	});
}

export function useAddStaffMember() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ userId, role }: { userId: string; role: StaffRole }) => addStaffMember(userId, role),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: staffKeys.all });
			queryClient.invalidateQueries({ queryKey: profileKeys.all });
		},
	});
}

export function useSetStaffRole() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ userId, role }: { userId: string; role: StaffRole }) => setStaffRole(userId, role),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: staffKeys.all });
			queryClient.invalidateQueries({ queryKey: profileKeys.all });
		},
	});
}

export function useRemoveStaffMember() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (userId: string) => removeStaffMember(userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: staffKeys.all });
			queryClient.invalidateQueries({ queryKey: profileKeys.all });
			queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
		},
	});
}
