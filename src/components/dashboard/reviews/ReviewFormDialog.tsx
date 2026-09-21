import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon } from '@hugeicons/core-free-icons';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/auth/use-auth';
import { useCreateReview, useUpdateReview } from '@/hooks/queries/use-reviews';
import { getReviewInitials } from '@/lib/reviews';
import { reviewSchema, type ReviewValues } from '@/lib/validation/review-schema';
import type { Tables } from '@/types/supabase';

const RATING_OPTIONS: ReviewValues['rating'][] = ['5', '4', '3', '2', '1'];

function toDefaultValues(review: Tables<'reviews'> | null): ReviewValues {
	return {
		name: review?.name ?? '',
		info: review?.info ?? '',
		avatarUrl: review?.avatar_url ?? '',
		rating: (String(review?.rating ?? 5) as ReviewValues['rating']) ?? '5',
		quote: review?.quote ?? '',
		reviewUrl: review?.review_url ?? '',
		reviewedAt: review?.reviewed_at ?? '',
		sortOrder: String(review?.sort_order ?? 0),
		isPublished: review?.is_published ?? true,
	};
}

export function ReviewFormDialog({
	review,
	onOpenChange,
}: {
	review: Tables<'reviews'> | null;
	onOpenChange: (open: boolean) => void;
}) {
	const { user } = useAuth();
	const createReview = useCreateReview();
	const updateReview = useUpdateReview();

	const form = useForm<ReviewValues>({
		resolver: zodResolver(reviewSchema),
		defaultValues: toDefaultValues(review),
	});

	const avatarUrl = form.watch('avatarUrl');
	const name = form.watch('name');

	async function onSubmit(values: ReviewValues) {
		const fields = {
			name: values.name.trim(),
			info: values.info?.trim() || null,
			avatar_url: values.avatarUrl || null,
			rating: Number(values.rating),
			quote: values.quote.trim(),
			review_url: values.reviewUrl || null,
			reviewed_at: values.reviewedAt || null,
			sort_order: values.sortOrder === '' ? 0 : Number(values.sortOrder),
			is_published: values.isPublished,
		};

		try {
			if (review) {
				await updateReview.mutateAsync({ id: review.id, updates: fields });
				toast.success('Review updated.');
			} else {
				await createReview.mutateAsync({ ...fields, created_by: user?.id ?? null });
				toast.success('Review added.');
			}
			onOpenChange(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to save review.');
		}
	}

	return (
		<Dialog open onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{review ? 'Edit review' : 'New review'}</DialogTitle>
					<DialogDescription>
						{review ? review.name : 'Copy a review from your Google Business profile so it shows on the landing page.'}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="info"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Info (optional)</FormLabel>
										<FormControl>
											<Input placeholder="Homeowner, Miami" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="avatarUrl"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Avatar URL (optional)</FormLabel>
									<div className="flex items-center gap-3">
										<Avatar size="lg" className="shrink-0">
											<AvatarImage src={avatarUrl || undefined} alt={name || 'Avatar preview'} />
											<AvatarFallback>{getReviewInitials(name)}</AvatarFallback>
										</Avatar>
										<FormControl>
											<Input placeholder="https://lh3.googleusercontent.com/a/..." {...field} />
										</FormControl>
									</div>
									<FormDescription>
										Right-click the reviewer photo on Google and copy the image address. Initials show if it fails to
										load.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="quote"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Review</FormLabel>
									<FormControl>
										<Textarea rows={5} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-3 gap-4">
							<FormField
								control={form.control}
								name="rating"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Rating</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{RATING_OPTIONS.map((value) => (
													<SelectItem key={value} value={value}>
														<span className="flex items-center gap-1">
															{Array.from({ length: Number(value) }).map((_, index) => (
																<HugeiconsIcon
																	key={index}
																	icon={StarIcon}
																	strokeWidth={0}
																	className="size-3 fill-amber-400 text-amber-400"
																/>
															))}
														</span>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="reviewedAt"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Reviewed on</FormLabel>
										<FormControl>
											<Input type="date" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="sortOrder"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Order</FormLabel>
										<FormControl>
											<Input type="number" step="1" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="reviewUrl"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Link to the Google review (optional)</FormLabel>
									<FormControl>
										<Input placeholder="https://www.google.com/search?q=alianci+cleaning#lrd=..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="isPublished"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border border-input p-4">
									<div className="flex flex-col gap-1">
										<FormLabel>Published</FormLabel>
										<FormDescription>Published reviews appear on the landing page.</FormDescription>
									</div>
									<FormControl>
										<Switch checked={field.value} onCheckedChange={field.onChange} />
									</FormControl>
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? 'Saving...' : review ? 'Save' : 'Add review'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
