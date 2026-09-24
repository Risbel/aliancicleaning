import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { format } from 'date-fns';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	ArrowUpDownIcon,
	Calendar03Icon,
	Cancel01Icon,
	ChevronDownIcon,
	InformationCircleIcon,
	LeftToRightListBulletIcon,
	LoaderCircle,
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
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { AssignQuoteDialog } from '@/components/dashboard/quotes/AssignQuoteDialog';
import { ChangeQuoteStatusDialog } from '@/components/dashboard/quotes/ChangeQuoteStatusDialog';
import { EditQuoteDialog } from '@/components/dashboard/quotes/EditQuoteDialog';
import { QuoteDetailsDialog } from '@/components/dashboard/quotes/QuoteDetailsDialog';
import { QuoteRowActions, type QuoteActions } from '@/components/dashboard/quotes/QuoteRowActions';
import { SendConfirmationDialog } from '@/components/dashboard/quotes/SendConfirmationDialog';
import { useAuth } from '@/hooks/auth/use-auth';
import { useCustomer } from '@/hooks/queries/use-customers';
import { useStaffProfile, useStaffProfiles } from '@/hooks/queries/use-profile';
import { useDeleteQuote, useQuotes, useUpdateQuote } from '@/hooks/queries/use-quotes';
import { usePageMeta } from '@/hooks/usePageMeta';
import { QuotesCalendar } from '@/components/dashboard/quotes/calendar/QuotesCalendar';
import { cn } from '@/lib/utils';
import { formatCalendarAnchor, parseCalendarAnchor, parseCalendarMode, type CalendarMode } from '@/lib/calendar';
import {
	QUOTE_CALENDAR_STATUSES,
	QUOTE_FILTER_TAGS,
	QUOTE_STATUS_BADGE_VARIANT,
	QUOTE_STATUSES,
	type QuoteStatus,
} from '@/lib/quote-status';
import type { QuoteStatusFilter, QuoteWithPlan } from '@/services/quotes';
import type { Tables, TablesUpdate } from '@/types/supabase';

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
	usePageMeta({
		title: 'Quotes | Alianci Cleaning Dashboard',
		path: '/dashboard/quotes',
		noIndex: true,
	});

	const [searchParams, setSearchParams] = useSearchParams();
	const view = searchParams.get('view') === 'calendar' ? 'calendar' : 'list';
	const isCalendar = view === 'calendar';
	const statusParam = searchParams.get('status') as QuoteStatusFilter | null;
	const status = statusParam || 'pending';
	const calendarMode = parseCalendarMode(searchParams.get('cal'));
	const calendarAnchor = parseCalendarAnchor(searchParams.get('date'));
	const calendarStatuses = useMemo<QuoteStatus[]>(() => {
		if (!statusParam || statusParam === 'pending') return QUOTE_CALENDAR_STATUSES;
		if (statusParam === 'all') return QUOTE_STATUSES.map((option) => option.value);
		if (statusParam === 'expired') return ['pending'];
		return [statusParam];
	}, [statusParam]);
	const search = searchParams.get('q') ?? '';
	const customerId = searchParams.get('customer') ?? undefined;
	const { data: filterCustomer } = useCustomer(customerId);
	const assignedId = searchParams.get('assigned') ?? undefined;

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
	const { data: staffProfiles } = useStaffProfiles();
	const filterAssignee = staffProfiles?.find((member) => member.id === assignedId);

	const {
		data: quotes,
		isLoading,
		isError,
	} = useQuotes({
		status,
		search: search || undefined,
		assignedTo: isAdmin ? assignedId : user?.id,
		customerId,
		enabled: !isCalendar,
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

	function setView(nextView: 'list' | 'calendar') {
		setSearchParams((params) => {
			if (nextView === 'list') {
				params.delete('view');
				params.delete('cal');
				params.delete('date');
			} else {
				params.set('view', 'calendar');
			}
			return params;
		});
	}

	function setCalendarMode(nextMode: CalendarMode) {
		setSearchParams((params) => {
			params.set('cal', nextMode);
			return params;
		});
	}

	function setCalendarAnchor(nextAnchor: Date) {
		setSearchParams((params) => {
			params.set('date', formatCalendarAnchor(nextAnchor));
			return params;
		});
	}

	function clearCustomerFilter() {
		setSearchParams((params) => {
			params.delete('customer');
			return params;
		});
	}

	function clearAssigneeFilter() {
		setSearchParams((params) => {
			params.delete('assigned');
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

	const quoteActions = useMemo<QuoteActions>(
		() => ({
			isAdmin,
			onView: setViewingQuote,
			onEdit: setEditingQuote,
			onChangeStatus: setChangingStatusQuote,
			onAssign: setAssigningQuote,
			onSendConfirmation: setConfirmationQuote,
			onDelete: setDeletingQuote,
		}),
		[isAdmin],
	);

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
				cell: ({ row }) => (
					<div className="text-right">
						<QuoteRowActions quote={row.original} actions={quoteActions} />
					</div>
				),
			},
		],
		[quoteActions, updateQuote.isPending, updateQuote.variables],
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
		<div className="px-6 py-8 lg:px-12">
			<div className={cn('mx-auto', isCalendar ? 'max-w-[1600px]' : 'max-w-6xl')}>
				<h1 className="mb-6 text-2xl font-bold text-foreground">Quotes</h1>

				<div className="mb-4 flex flex-wrap gap-2">
					{QUOTE_FILTER_TAGS.filter((tag) => !isCalendar || tag.value !== 'expired').map((tag) => (
						<button key={tag.value} type="button" onClick={() => setStatus(tag.value)}>
							<Badge
								variant={status === tag.value ? QUOTE_STATUS_BADGE_VARIANT[tag.value] : 'outline'}
								className={cn(status === tag.value && 'ring-2 ring-ring/30')}
							>
								{isCalendar && tag.value === 'pending' ? 'Scheduled' : tag.label}
							</Badge>
						</button>
					))}
				</div>

				{customerId && (
					<div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
						Client:
						<Badge variant="outline" className="gap-1 pr-1">
							{filterCustomer?.full_name ?? 'Loading...'}
							<button type="button" onClick={clearCustomerFilter} aria-label="Clear client filter">
								<HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
							</button>
						</Badge>
					</div>
				)}

				{isAdmin && assignedId && (
					<div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
						Assigned to:
						<Badge variant="outline" className="gap-1 pr-1">
							{filterAssignee?.full_name ?? 'Loading...'}
							<button type="button" onClick={clearAssigneeFilter} aria-label="Clear assignee filter">
								<HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
							</button>
						</Badge>
					</div>
				)}

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
					<div className="ml-auto flex items-center gap-1 rounded-4xl border border-input p-1">
						<Button
							variant={isCalendar ? 'ghost' : 'default'}
							size="sm"
							className={cn('h-7 gap-2', isCalendar && 'text-muted-foreground')}
							onClick={() => setView('list')}
						>
							<HugeiconsIcon icon={LeftToRightListBulletIcon} className="size-4" />
							List
						</Button>
						<Button
							variant={isCalendar ? 'default' : 'ghost'}
							size="sm"
							className={cn('h-7 gap-2', !isCalendar && 'text-muted-foreground')}
							onClick={() => setView('calendar')}
						>
							<HugeiconsIcon icon={Calendar03Icon} className="size-4" />
							Calendar
						</Button>
					</div>

					{!isCalendar && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline">
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
					)}
				</div>

				{!isCalendar && (
					<Alert className="mb-6" variant={'warning'}>
						<HugeiconsIcon icon={InformationCircleIcon} />
						<AlertTitle>How to move a quote forward</AlertTitle>
						<AlertDescription>
							Edit the quote to set its final price, then send the confirmation link — this marks the quote as
							&quot;quoted&quot;. The client accepts automatically when they open the link, which sets the quote to
							&quot;accepted&quot; and locks its status.
						</AlertDescription>
					</Alert>
				)}

				{isCalendar && (
					<QuotesCalendar
						mode={calendarMode}
						anchor={calendarAnchor}
						statuses={calendarStatuses}
						search={search || undefined}
						assignedTo={isAdmin ? assignedId : user?.id}
						customerId={customerId}
						onModeChange={setCalendarMode}
						onAnchorChange={setCalendarAnchor}
						actions={quoteActions}
					/>
				)}

				{!isCalendar && isLoading && <p className="text-sm text-muted-foreground">Loading quotes...</p>}
				{!isCalendar && isError && <p className="text-sm text-destructive">Failed to load quotes.</p>}
				{!isCalendar && !isLoading && !isError && quotes?.length === 0 && (
					<p className="text-sm text-muted-foreground">No quotes found.</p>
				)}

				{!isCalendar && !isLoading && !isError && quotes && quotes.length > 0 && (
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
