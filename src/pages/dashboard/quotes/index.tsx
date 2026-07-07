import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { format } from 'date-fns';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	ArrowUpDownIcon,
	ChevronDownIcon,
	ChevronLeftIcon,
	EyeIcon,
	InformationCircleIcon,
	LoaderCircle,
	MoreHorizontalIcon,
	Pen,
	RadioButtonFreeIcons,
	Send,
	Trash,
	UserCheck,
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { AssignQuoteDialog } from '@/components/dashboard/quotes/AssignQuoteDialog';
import { ChangeQuoteStatusDialog } from '@/components/dashboard/quotes/ChangeQuoteStatusDialog';
import { EditQuoteDialog } from '@/components/dashboard/quotes/EditQuoteDialog';
import { QuoteDetailsDialog } from '@/components/dashboard/quotes/QuoteDetailsDialog';
import { SendConfirmationDialog } from '@/components/dashboard/quotes/SendConfirmationDialog';
import { useAuth } from '@/hooks/auth/use-auth';
import { useStaffProfile } from '@/hooks/queries/use-profile';
import { useDeleteQuote, useQuotes, useUpdateQuote } from '@/hooks/queries/use-quotes';
import { cn } from '@/lib/utils';
import { QUOTE_FILTER_TAGS, QUOTE_STATUS_BADGE_VARIANT, type QuoteStatus } from '@/lib/quote-status';
import type { QuoteStatusFilter, QuoteWithPlan } from '@/services/quotes';
import type { Tables, TablesUpdate } from '@/types/supabase';
import { buttonVariants } from '@/components/ui/button-variants';

function displayStatus(quote: Tables<'quotes'>): QuoteStatusFilter {
	if (quote.status === 'pending' && new Date(quote.desired_visit_date) < new Date()) return 'expired';
	return quote.status;
}

function SortableHeader({ column, label }: { column: Column<QuoteWithPlan, unknown>; label: string }) {
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

export default function DashboardQuotesPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const status = (searchParams.get('status') as QuoteStatusFilter) || 'pending';
	const search = searchParams.get('q') ?? '';

	const [searchInput, setSearchInput] = useState(search);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
		customer_name: true,
		customer_email: true,
		customer_phone: false,
		plan: false,
		desired_visit_date: true,
		estimated_price: false,
		final_price: true,
		status: true,
		created_at: false,
	});

	const { user } = useAuth();
	const { data: staffProfile } = useStaffProfile(user?.id);
	const isAdmin = staffProfile?.role === 'admin';

	const {
		data: quotes,
		isLoading,
		isError,
	} = useQuotes({
		status,
		search: search || undefined,
		assignedTo: isAdmin ? undefined : user?.id,
	});

	const [editingQuote, setEditingQuote] = useState<Tables<'quotes'> | null>(null);
	const [assigningQuote, setAssigningQuote] = useState<Tables<'quotes'> | null>(null);
	const [deletingQuote, setDeletingQuote] = useState<Tables<'quotes'> | null>(null);
	const [changingStatusQuote, setChangingStatusQuote] = useState<Tables<'quotes'> | null>(null);
	const [confirmationQuote, setConfirmationQuote] = useState<Tables<'quotes'> | null>(null);
	const [viewingQuote, setViewingQuote] = useState<Tables<'quotes'> | null>(null);
	const deleteQuote = useDeleteQuote();
	const updateQuote = useUpdateQuote();

	async function handleConfirmDelete() {
		if (!deletingQuote) return;
		try {
			await deleteQuote.mutateAsync(deletingQuote.id);
			toast('Quote deleted.');
			setDeletingQuote(null);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to delete quote.');
		}
	}

	async function handleStatusChange(quote: Tables<'quotes'>, nextStatus: QuoteStatus) {
		if (nextStatus === quote.status) return;

		const updates: TablesUpdate<'quotes'> = { status: nextStatus };
		const mintsToken = nextStatus === 'quoted' && !quote.confirmation_token;
		if (mintsToken) updates.confirmation_token = crypto.randomUUID();

		try {
			const updated = await updateQuote.mutateAsync({ id: quote.id, updates });
			toast.success('Status updated.');
			if (mintsToken && updated.confirmation_token) setConfirmationQuote(updated);
			setChangingStatusQuote(null);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to update status.');
		}
	}

	function setStatus(nextStatus: QuoteStatusFilter) {
		setSearchParams((params) => {
			if (nextStatus === 'pending') params.delete('status');
			else params.set('status', nextStatus);
			return params;
		});
	}

	const debouncedSetSearch = useDebouncedCallback((value: string) => {
		setSearchParams((params) => {
			if (value) params.set('q', value);
			else params.delete('q');
			return params;
		});
	}, 400);

	function handleSearchChange(value: string) {
		setSearchInput(value);
		debouncedSetSearch(value);
	}

	const columns = useMemo<ColumnDef<QuoteWithPlan>[]>(
		() => [
			{
				accessorKey: 'customer_name',
				header: ({ column }) => <SortableHeader column={column} label="Customer" />,
			},
			{
				accessorKey: 'customer_email',
				header: 'Email',
			},
			{
				accessorKey: 'customer_phone',
				header: 'Phone',
			},
			{
				id: 'plan',
				accessorFn: (quote) => quote.cleaning_plans?.name ?? '-',
				header: 'Plan',
			},
			{
				accessorKey: 'desired_visit_date',
				header: ({ column }) => <SortableHeader column={column} label="Desired visit" />,
				sortingFn: 'datetime',
				cell: ({ getValue }) => format(new Date(getValue<string>()), 'M/d/yyyy h:mm a'),
			},
			{
				accessorKey: 'estimated_price',
				header: 'Estimated price',
				cell: ({ getValue }) => {
					const value = getValue<number | null>();
					return value != null ? `$${value.toFixed(2)}` : '-';
				},
			},
			{
				accessorKey: 'final_price',
				header: ({ column }) => <SortableHeader column={column} label="Final price" />,
				cell: ({ getValue }) => {
					const value = getValue<number | null>();
					return value != null ? `$${value.toFixed(2)}` : '-';
				},
			},
			{
				accessorKey: 'status',
				header: 'Status',
				cell: ({ row }) => {
					const quote = row.original;
					return (
						<div className="flex items-center gap-2">
							<Badge variant={QUOTE_STATUS_BADGE_VARIANT[displayStatus(quote)]}>{displayStatus(quote)}</Badge>
							{updateQuote.isPending && updateQuote.variables?.id === quote.id && (
								<HugeiconsIcon icon={LoaderCircle} className="size-4 animate-spin" />
							)}
						</div>
					);
				},
			},
			{
				accessorKey: 'created_at',
				header: ({ column }) => <SortableHeader column={column} label="Created" />,
				sortingFn: 'datetime',
				cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
			},
			{
				id: 'actions',
				enableHiding: false,
				header: () => <div className="text-right">Actions</div>,
				cell: ({ row }) => {
					const quote = row.original;
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
									<DropdownMenuItem className="justify-between" onClick={() => setViewingQuote(quote)}>
										View details <HugeiconsIcon icon={EyeIcon} className="size-4" />
									</DropdownMenuItem>
									<DropdownMenuItem className="justify-between" onClick={() => setEditingQuote(quote)}>
										Edit <HugeiconsIcon icon={Pen} className="size-4" />
									</DropdownMenuItem>
									<DropdownMenuItem className="justify-between" onClick={() => setChangingStatusQuote(quote)}>
										Change status <HugeiconsIcon icon={RadioButtonFreeIcons} className="size-4" />
									</DropdownMenuItem>
									<DropdownMenuItem
										disabled={
											quote.final_price == null ||
											quote.status === 'accepted' ||
											quote.status === 'quoted' ||
											quote.status === 'completed' ||
											quote.status === 'cancelled'
										}
										onClick={() => setConfirmationQuote(quote)}
										className="justify-between"
									>
										Send confirmation <HugeiconsIcon icon={Send} className="size-4" />
									</DropdownMenuItem>
									{isAdmin && (
										<DropdownMenuItem className="justify-between" onClick={() => setAssigningQuote(quote)}>
											Assign <HugeiconsIcon icon={UserCheck} className="size-4" />
										</DropdownMenuItem>
									)}
									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="justify-between"
										variant="destructive"
										onClick={() => setDeletingQuote(quote)}
									>
										Delete <HugeiconsIcon icon={Trash} className="size-4" />
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					);
				},
			},
		],
		[isAdmin, updateQuote.isPending, updateQuote.variables],
	);

	const table = useReactTable({
		data: quotes ?? [],
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
		<div className="min-h-dvh bg-background px-6 py-10 lg:px-12">
			<Link className={cn('mb-6 absolute top-2 left-2', buttonVariants({ variant: 'ghost', size: 'sm' }))} to="/">
				<HugeiconsIcon icon={ChevronLeftIcon} className="size-5" />
				Go Home
			</Link>
			<div className="mx-auto max-w-6xl">
				<h1 className="mb-6 text-2xl font-bold text-foreground">Quotes</h1>

				<div className="mb-4 flex flex-wrap gap-2">
					{QUOTE_FILTER_TAGS.map((tag) => (
						<button key={tag.value} type="button" onClick={() => setStatus(tag.value)}>
							<Badge
								variant={status === tag.value ? QUOTE_STATUS_BADGE_VARIANT[tag.value] : 'outline'}
								className={cn(status === tag.value && 'ring-2 ring-ring/30')}
							>
								{tag.label}
							</Badge>
						</button>
					))}
				</div>

				<div className="mb-6 flex items-center gap-2">
					<label htmlFor="quote-search" className="sr-only">
						Search quotes
					</label>
					<Input
						id="quote-search"
						name="quote-search"
						value={searchInput}
						onChange={(event) => handleSearchChange(event.target.value)}
						placeholder="Search by name or email"
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

				<Alert className="mb-6" variant={'warning'}>
					<HugeiconsIcon icon={InformationCircleIcon} />
					<AlertTitle>How to move a quote forward</AlertTitle>
					<AlertDescription>
						Edit the quote to set its final price, then send the confirmation link — this marks the quote as
						&quot;quoted&quot;. The client accepts automatically when they open the link, which sets the quote to
						&quot;accepted&quot; and locks its status.
					</AlertDescription>
				</Alert>

				{isLoading && <p className="text-sm text-muted-foreground">Loading quotes...</p>}
				{isError && <p className="text-sm text-destructive">Failed to load quotes.</p>}
				{!isLoading && !isError && quotes?.length === 0 && (
					<p className="text-sm text-muted-foreground">No quotes found.</p>
				)}

				{!isLoading && !isError && quotes && quotes.length > 0 && (
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

				{viewingQuote && (
					<QuoteDetailsDialog quote={viewingQuote} onOpenChange={(open) => !open && setViewingQuote(null)} />
				)}

				{editingQuote && (
					<EditQuoteDialog quote={editingQuote} onOpenChange={(open) => !open && setEditingQuote(null)} />
				)}

				{assigningQuote && (
					<AssignQuoteDialog quote={assigningQuote} onOpenChange={(open) => !open && setAssigningQuote(null)} />
				)}

				{changingStatusQuote && (
					<ChangeQuoteStatusDialog
						quote={changingStatusQuote}
						onOpenChange={(open) => !open && setChangingStatusQuote(null)}
						onSubmit={(status) => handleStatusChange(changingStatusQuote, status)}
						isPending={updateQuote.isPending && updateQuote.variables?.id === changingStatusQuote.id}
					/>
				)}

				{confirmationQuote && (
					<SendConfirmationDialog
						quote={confirmationQuote}
						onOpenChange={(open) => !open && setConfirmationQuote(null)}
					/>
				)}

				<AlertDialog open={!!deletingQuote} onOpenChange={(open) => !open && setDeletingQuote(null)}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete this quote?</AlertDialogTitle>
							<AlertDialogDescription>
								This will permanently delete the quote from {deletingQuote?.customer_name}. This action cannot be
								undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction onClick={handleConfirmDelete} disabled={deleteQuote.isPending}>
								{deleteQuote.isPending ? 'Deleting...' : 'Delete'}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}
