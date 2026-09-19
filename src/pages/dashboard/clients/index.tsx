import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	ArrowUpDownIcon,
	ChevronDownIcon,
	FileAddIcon,
	GitMergeIcon,
	ListChecks,
	MoreHorizontalIcon,
	Pen,
	UserAdd01Icon,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClientFormDialog } from '@/components/dashboard/clients/ClientFormDialog';
import { CreateQuoteDialog } from '@/components/dashboard/clients/CreateQuoteDialog';
import { MergeClientDialog } from '@/components/dashboard/clients/MergeClientDialog';
import { useCustomers } from '@/hooks/queries/use-customers';
import { usePageMeta } from '@/hooks/usePageMeta';
import { cn } from '@/lib/utils';
import type { CustomerTypeFilter, CustomerWithQuoteCount } from '@/services/customers';
import type { Tables } from '@/types/supabase';

const CUSTOMER_FILTER_TAGS: { value: CustomerTypeFilter; label: string }[] = [
	{ value: 'all', label: 'All' },
	{ value: 'account', label: 'With account' },
	{ value: 'manual', label: 'Manual' },
];

function formatAddress(customer: Tables<'customer_profiles'>) {
	return [customer.address_line, customer.city, customer.state, customer.zip_code].filter(Boolean).join(', ');
}

function SortableHeader({ column, label }: { column: Column<CustomerWithQuoteCount, unknown>; label: string }) {
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

export default function DashboardClientsPage() {
	usePageMeta({
		title: 'Clients | Alianci Cleaning Dashboard',
		path: '/dashboard/clients',
		noIndex: true,
	});

	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const type = (searchParams.get('type') as CustomerTypeFilter) || 'all';
	const search = searchParams.get('q') ?? '';

	const [searchInput, setSearchInput] = useState(search);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
		full_name: true,
		phone: true,
		email: true,
		address: false,
		type: true,
		quotes: true,
		created_at: false,
	});

	const { data: customers, isLoading, isError } = useCustomers({ type, search: search || undefined });

	const [formCustomer, setFormCustomer] = useState<Tables<'customer_profiles'> | null | undefined>(undefined);
	const [mergingCustomer, setMergingCustomer] = useState<CustomerWithQuoteCount | null>(null);
	const [quotingCustomer, setQuotingCustomer] = useState<CustomerWithQuoteCount | null>(null);

	function setType(nextType: CustomerTypeFilter) {
		setSearchParams((params) => {
			if (nextType === 'all') params.delete('type');
			else params.set('type', nextType);
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

	const columns = useMemo<ColumnDef<CustomerWithQuoteCount>[]>(
		() => [
			{
				accessorKey: 'full_name',
				header: ({ column }) => <SortableHeader column={column} label="Client" />,
			},
			{
				accessorKey: 'phone',
				header: 'Phone',
				cell: ({ getValue }) => getValue<string | null>() ?? '-',
			},
			{
				accessorKey: 'email',
				header: 'Email',
				cell: ({ getValue }) => getValue<string | null>() ?? '-',
			},
			{
				id: 'address',
				accessorFn: (customer) => formatAddress(customer) || '-',
				header: 'Address',
			},
			{
				id: 'type',
				accessorFn: (customer) => (customer.user_id ? 'account' : 'manual'),
				header: 'Type',
				cell: ({ getValue }) =>
					getValue<string>() === 'account' ? (
						<Badge variant="success">Account</Badge>
					) : (
						<Badge variant="secondary">Manual</Badge>
					),
			},
			{
				id: 'quotes',
				accessorFn: (customer) => customer.quotes[0]?.count ?? 0,
				header: ({ column }) => <SortableHeader column={column} label="Quotes" />,
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
					const customer = row.original;
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
									<DropdownMenuItem className="justify-between" onClick={() => setQuotingCustomer(customer)}>
										New quote <HugeiconsIcon icon={FileAddIcon} className="size-4" />
									</DropdownMenuItem>
									<DropdownMenuItem className="justify-between" onClick={() => setFormCustomer(customer)}>
										Edit <HugeiconsIcon icon={Pen} className="size-4" />
									</DropdownMenuItem>
									<DropdownMenuItem
										className="justify-between"
										onClick={() => navigate(`/dashboard/quotes?status=all&customer=${customer.id}`)}
									>
										View quotes <HugeiconsIcon icon={ListChecks} className="size-4" />
									</DropdownMenuItem>
									{!customer.user_id && (
										<DropdownMenuItem className="justify-between" onClick={() => setMergingCustomer(customer)}>
											Merge into account <HugeiconsIcon icon={GitMergeIcon} className="size-4" />
										</DropdownMenuItem>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					);
				},
			},
		],
		[navigate],
	);

	const table = useReactTable({
		data: customers ?? [],
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
					<h1 className="text-2xl font-bold text-foreground">Clients</h1>
					<Button onClick={() => setFormCustomer(null)}>
						<HugeiconsIcon icon={UserAdd01Icon} className="size-4" />
						New client
					</Button>
				</div>

				<div className="mb-4 flex flex-wrap gap-2">
					{CUSTOMER_FILTER_TAGS.map((tag) => (
						<button key={tag.value} type="button" onClick={() => setType(tag.value)}>
							<Badge
								variant={type === tag.value ? 'primary' : 'outline'}
								className={cn(type === tag.value && 'ring-2 ring-ring/30')}
							>
								{tag.label}
							</Badge>
						</button>
					))}
				</div>

				<div className="mb-6 flex items-center gap-2">
					<label htmlFor="client-search" className="sr-only">
						Search clients
					</label>
					<Input
						id="client-search"
						name="client-search"
						value={searchInput}
						onChange={(event) => handleSearchChange(event.target.value)}
						placeholder="Search by name, email or phone"
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

				{isLoading && <p className="text-sm text-muted-foreground">Loading clients...</p>}
				{isError && <p className="text-sm text-destructive">Failed to load clients.</p>}
				{!isLoading && !isError && customers?.length === 0 && (
					<p className="text-sm text-muted-foreground">No clients found.</p>
				)}

				{!isLoading && !isError && customers && customers.length > 0 && (
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

				{formCustomer !== undefined && (
					<ClientFormDialog customer={formCustomer} onOpenChange={(open) => !open && setFormCustomer(undefined)} />
				)}

				{mergingCustomer && (
					<MergeClientDialog customer={mergingCustomer} onOpenChange={(open) => !open && setMergingCustomer(null)} />
				)}

				{quotingCustomer && (
					<CreateQuoteDialog customer={quotingCustomer} onOpenChange={(open) => !open && setQuotingCustomer(null)} />
				)}
			</div>
		</div>
	);
}
