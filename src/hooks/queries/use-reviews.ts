import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewKeys } from '@/lib/query-keys';
import { createReview, deleteReview, getAllReviews, getPublishedReviews, updateReview } from '@/services/reviews';
import type { TablesInsert, TablesUpdate } from '@/types/supabase';

export function usePublishedReviews() {
	return useQuery({
		queryKey: reviewKeys.lists(),
		queryFn: getPublishedReviews,
		staleTime: 5 * 60 * 1000,
	});
}

export function useAllReviews() {
	return useQuery({
		queryKey: reviewKeys.adminList(),
		queryFn: getAllReviews,
	});
}

export function useCreateReview() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (review: TablesInsert<'reviews'>) => createReview(review),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: reviewKeys.all });
		},
	});
}

export function useUpdateReview() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'reviews'> }) => updateReview(id, updates),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: reviewKeys.all });
		},
	});
}

export function useDeleteReview() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteReview(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: reviewKeys.all });
		},
	});
}
