import type { MouseEvent } from 'react';
import { toast } from 'sonner';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteReview } from '@/hooks/queries/use-reviews';
import type { Tables } from '@/types/supabase';

export function DeleteReviewDialog({
	review,
	onOpenChange,
}: {
	review: Tables<'reviews'>;
	onOpenChange: (open: boolean) => void;
}) {
	const deleteReview = useDeleteReview();

	async function handleConfirm(event: MouseEvent) {
		event.preventDefault();
		try {
			await deleteReview.mutateAsync(review.id);
			toast.success('Review deleted.');
			onOpenChange(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to delete review.');
		}
	}

	return (
		<AlertDialog open onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete the review from {review.name}?</AlertDialogTitle>
					<AlertDialogDescription>
						This cannot be undone. To take it off the landing page without losing the text, unpublish it instead.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleConfirm} disabled={deleteReview.isPending}>
						{deleteReview.isPending ? 'Deleting...' : 'Delete'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
