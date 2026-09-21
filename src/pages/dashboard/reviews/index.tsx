import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	ArrowUpDownIcon,
	ChevronDownIcon,
	Delete02Icon,
	Edit02Icon,
	LinkSquare02Icon,
	MoreHorizontalIcon,
	PlusSignIcon,
	StarIcon,
	ViewIcon,
	ViewOffIcon,
} from '@hugeicons/core-free-icons';
import {
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type Column,
	type ColumnDef,
	type SortingState,
	type VisibilityState,
} from '@tanstack/react-table';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatCard } from '@/components/dashboard/StatCard';
import { ReviewFormDialog } from '@/components/dashboard/reviews/ReviewFormDialog';
import { DeleteReviewDialog } from '@/components/dashboard/reviews/DeleteReviewDialog';
import { useAllReviews, useUpdateReview } from '@/hooks/queries/use-reviews';
import { usePageMeta } from '@/hooks/usePageMeta';
import { getReviewInitials } from '@/lib/reviews';
import { cn } from '@/lib/utils';
import type { Tables } from '@/types/supabase';

type Review = Tables<'reviews'>;
type StatusFilter = 'all' | 'published' | 'draft';

const STATUS_FILTER_TAGS: { value: StatusFilter; label: string }[] = [
	{ value: 'all', label: 'All' },
	{ value: 'published', label: 'Published' },
	{ value: 'draft', label: 'Drafts' },
];

function SortableHeader({ column, label }: { column: Column<Review, unknown>; label: string }) {
	return (
		<Button
			variant="ghost"
			size="sm"
			className="-ml-3 h-8"
			onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
		>
			{label}
			<HugeiconsIcon icon={ArrowUpDownIcon} className="size-4" />
		</Button>
	);
}

export default function DashboardReviewsPage() {
	usePageMeta({
		title: 'Reviews | Alianci Cleaning Dashboard',
		path: '/dashboard/reviews',
		noIndex: true,
	});

	const { data: reviews, isLoading, isError } = useAllReviews();
	const updateReview = useUpdateReview();

	const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
	const [search, setSearch] = useState('');
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
		reviewer: true,
		rating: true,
		quote: true,
		status: true,
		order: true,
		reviewed_at: true,
		added: false,
	});

	const [editingReview, setEditingReview] = useState<Review | null>(null);
	const [isAdding, setIsAdding] = useState(false);
	const [deletingReview, setDeletingReview] = useState<Review | null>(null);

	const filteredReviews = useMemo(() => {
		const term = search.trim().toLowerCase();
		return (reviews ?? []).filter((review) => {
			if (statusFilter === 'published' && !review.is_published) return false;
			if (statusFilter === 'draft' && review.is_published) return false;
			if (!term) return true;
			return (
				review.name.toLowerCase().includes(term) ||
				review.quote.toLowerCase().includes(term) ||
				!!review.info?.toLowerCase().includes(term)
			);
		});
	}, [reviews, statusFilter, search]);

	const totals = useMemo(() => {
		const list = reviews ?? [];
		const published = list.filter((review) => review.is_published);
		const average = published.length
			? published.reduce((sum, review) => sum + review.rating, 0) / published.length
			: null;
		return {
			total: list.length,
			published: published.length,
			drafts: list.length - published.length,
			average,
		};
	}, [reviews]);

	async function togglePublished(review: Review) {
		try {
			await updateReview.mutateAsync({ id: review.id, updates: { is_published: !review.is_published } });
			toast.success(review.is_published ? 'Review unpublished.' : 'Review published.');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to update review.');
		}
	}

	const columns = useMemo<ColumnDef<Review>[]>(
		() => [
			{
				id: 'reviewer',
				accessorKey: 'name',
				header: ({ column }) => <SortableHeader column={column} label="Reviewer" />,
				cell: ({ row }) => (
					<div className="flex items-center gap-3">
						<Avatar className="shrink-0">
							<AvatarImage src={row.original.avatar_url ?? undefined} alt={row.original.name} />
							<AvatarFallback>{getReviewInitials(row.original.name)}</AvatarFallback>
						</Avatar>
						<div className="flex flex-col">
							<span className="font-medium text-foreground">{row.original.name}</span>
							<span className="text-xs text-muted-foreground">{row.original.info ?? '-'}</span>
						</div>
					</div>
				),
			},
			{
				id: 'rating',
				accessorKey: 'rating',
				header: ({ column }) => <SortableHeader column={column} label="Rating" />,
				cell: ({ getValue }) => {
					const rating = getValue<number>();
					return (
						<span className="flex items-center gap-0.5">
							{Array.from({ length: 5 }).map((_, index) => (
								<HugeiconsIcon
									key={index}
									icon={StarIcon}
									strokeWidth={0}
									className={cn('size-3.5', index < rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted')}
								/>
							))}
						</span>
					);
				},
			},
			{
				id: 'quote',
				accessorKey: 'quote',
				header: 'Review',
				cell: ({ getValue }) => (
					<p className="max-w-sm truncate text-sm text-muted-foreground">{getValue<string>()}</p>
				),
			},
			{
				id: 'status',
				accessorFn: (review) => (review.is_published ? 1 : 0),
				header: ({ column }) => <SortableHeader column={column} label="Status" />,
				cell: ({ row }) => (
					<Badge variant={row.original.is_published ? 'success' : 'outline'}>
						{row.original.is_published ? 'Published' : 'Draft'}
					</Badge>
				),
			},
			{
				id: 'order',
				accessorKey: 'sort_order',
				header: ({ column }) => <SortableHeader column={column} label="Order" />,
			},
			{
				id: 'reviewed_at',
				accessorFn: (review) => (review.reviewed_at ? new Date(review.reviewed_at).getTime() : 0),
				header: ({ column }) => <SortableHeader column={column} label="Reviewed on" />,
				cell: ({ row }) =>
					row.original.reviewed_at ? format(new Date(`${row.original.reviewed_at}T00:00:00`), 'MMM d, yyyy') : '-',
			},
			{
				id: 'added',
				accessorKey: 'created_at',
				header: ({ column }) => <SortableHeader column={column} label="Added" />,
				sortingFn: 'datetime',
				cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
			},
			{
				id: 'actions',
				enableHiding: false,
				header: () => <div className="text-right">Actions</div>,
				cell: ({ row }) => {
					const review = row.original;
					return (
						<div className="text-right">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon-sm">
										<HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
										<span className="sr-only">Open menu</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem className="justify-between" onClick={() => setEditingReview(review)}>
										Edit <HugeiconsIcon icon={Edit02Icon} className="size-4" />
									</DropdownMenuItem>
									<DropdownMenuItem className="justify-between" onClick={() => togglePublished(review)}>
										{review.is_published ? 'Unpublish' : 'Publish'}
										<HugeiconsIcon icon={review.is_published ? ViewOffIcon : ViewIcon} className="size-4" />
									</DropdownMenuItem>
									{review.review_url && (
										<DropdownMenuItem className="justify-between" asChild>
											<a href={review.review_url} target="_blank" rel="noopener noreferrer">
												Open on Google <HugeiconsIcon icon={LinkSquare02Icon} className="size-4" />
											</a>
										</DropdownMenuItem>
									)}
									<DropdownMenuSeparator />
									<DropdownMenuItem
										variant="destructive"
										className="justify-between"
										onClick={() => setDeletingReview(review)}
									>
										Delete <HugeiconsIcon icon={Delete02Icon} className="size-4" />
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					);
				},
			},
		],
		[],
	);

	const table = useReactTable({
		data: filteredReviews,
		columns,
		state: { sorting, columnVisibility },
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: { pagination: { pageSize: 10 } },
	});

	return (
		<div className="px-6 py-8 lg:px-12">
			<div className="mx-auto max-w-6xl">
				<div className="mb-6 flex items-center justify-between gap-4">
					<h1 className="text-2xl font-bold text-foreground">Reviews</h1>
					<Button onClick={() => setIsAdding(true)}>
						<HugeiconsIcon icon={PlusSignIcon} className="size-4" />
						Add review
					</Button>
				</div>

				{reviews && (
					<div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
						<StatCard label="Total reviews" value={String(totals.total)} hint="Every review on file" />
						<StatCard label="Published" value={String(totals.published)} hint="Showing on the landing page" />
						<StatCard label="Drafts" value={String(totals.drafts)} hint="Saved but not public" />
						<StatCard
							label="Average rating"
							value={totals.average === null ? '-' : totals.average.toFixed(1)}
							hint="Across published reviews"
						/>
					</div>
				)}

				<div className="mb-4 flex flex-wrap gap-2">
					{STATUS_FILTER_TAGS.map((tag) => (
						<button key={tag.value} type="button" onClick={() => setStatusFilter(tag.value)}>
							<Badge
								variant={statusFilter === tag.value ? 'primary' : 'outline'}
								className={cn(statusFilter === tag.value && 'ring-2 ring-ring/30')}
							>
								{tag.label}
							</Badge>
						</button>
					))}
				</div>

				<div className="mb-6 flex items-center gap-2">
					<label htmlFor="reviews-search" className="sr-only">
						Search reviews
					</label>
					<Input
						id="reviews-search"
						name="reviews-search"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Search by name or review text"
						className="max-w-sm"
					/>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="ml-auto">
								Columns <HugeiconsIcon icon={ChevronDownIcon} className="size-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{table
								.getAllColumns()
								.filter((column) => column.getCanHide())
								.map((column) => (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) => column.toggleVisibility(!!value)}
									>
										{column.id.replace(/_/g, ' ')}
									</DropdownMenuCheckboxItem>
								))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{isLoading && <p className="text-sm text-muted-foreground">Loading reviews...</p>}
				{isError && <p className="text-sm text-destructive">Failed to load reviews.</p>}
				{!isLoading && !isError && filteredReviews.length === 0 && (
					<p className="text-sm text-muted-foreground">No reviews found.</p>
				)}

				{!isLoading && !isError && filteredReviews.length > 0 && (
					<>
						<div className="rounded-lg border border-input">
							<Table>
								<TableHeader>
									{table.getHeaderGroups().map((headerGroup) => (
										<TableRow key={headerGroup.id}>
											{headerGroup.headers.map((header) => (
												<TableHead key={header.id}>
													{header.isPlaceholder
														? null
														: flexRender(header.column.columnDef.header, header.getContext())}
												</TableHead>
											))}
										</TableRow>
									))}
								</TableHeader>
								<TableBody>
									{table.getRowModel().rows.map((row) => (
										<TableRow key={row.id}>
											{row.getVisibleCells().map((cell) => (
												<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
											))}
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						<div className="mt-4 flex items-center justify-between">
							<p className="text-sm text-muted-foreground">
								Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
							</p>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => table.previousPage()}
									disabled={!table.getCanPreviousPage()}
								>
									Previous
								</Button>
								<Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
									Next
								</Button>
							</div>
						</div>
					</>
				)}

				{isAdding && <ReviewFormDialog review={null} onOpenChange={(open) => !open && setIsAdding(false)} />}

				{editingReview && (
					<ReviewFormDialog review={editingReview} onOpenChange={(open) => !open && setEditingReview(null)} />
				)}

				{deletingReview && (
					<DeleteReviewDialog review={deletingReview} onOpenChange={(open) => !open && setDeletingReview(null)} />
				)}
			</div>
		</div>
	);
}
