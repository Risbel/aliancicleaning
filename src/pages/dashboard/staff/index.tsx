import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	ArrowUpDownIcon,
	ChevronDownIcon,
	ListChecks,
	MoreHorizontalIcon,
	UserAdd01Icon,
	UserRemove01Icon,
	UserSwitchIcon,
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
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatCard } from '@/components/dashboard/StatCard';
import { AddStaffDialog } from '@/components/dashboard/staff/AddStaffDialog';
import { ChangeStaffRoleDialog } from '@/components/dashboard/staff/ChangeStaffRoleDialog';
import { RemoveStaffDialog } from '@/components/dashboard/staff/RemoveStaffDialog';
import { useAuth } from '@/hooks/auth/use-auth';
import { useStaffMembers } from '@/hooks/queries/use-staff';
import { usePageMeta } from '@/hooks/usePageMeta';
import { formatCurrency } from '@/lib/format';
import { STAFF_ROLES, getStaffRole } from '@/lib/staff-role';
import { cn } from '@/lib/utils';
import type { StaffMember, StaffRole } from '@/services/staff';

type RoleFilter = 'all' | StaffRole;

const ROLE_FILTER_TAGS: { value: RoleFilter; label: string }[] = [
	{ value: 'all', label: 'All' },
	...STAFF_ROLES.map((role) => ({ value: role.value, label: role.label })),
];

function getCompletionRate(member: StaffMember) {
	const closed = member.completed_quotes + member.cancelled_quotes + member.declined_quotes;
	return closed > 0 ? member.completed_quotes / closed : null;
}

function SortableHeader({ column, label }: { column: Column<StaffMember, unknown>; label: string }) {
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

export default function DashboardStaffPage() {
	usePageMeta({
		title: 'Staff | Alianci Cleaning Dashboard',
		path: '/dashboard/staff',
		noIndex: true,
	});

	const navigate = useNavigate();
	const { user } = useAuth();
	const { data: members, isLoading, isError } = useStaffMembers();

	const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
	const [search, setSearch] = useState('');
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
		member: true,
		role: true,
		open: true,
		completed: true,
		completion_rate: true,
		revenue: true,
		last_active: true,
		joined: false,
	});

	const [isAdding, setIsAdding] = useState(false);
	const [changingRoleMember, setChangingRoleMember] = useState<StaffMember | null>(null);
	const [removingMember, setRemovingMember] = useState<StaffMember | null>(null);

	const filteredMembers = useMemo(() => {
		const term = search.trim().toLowerCase();
		return (members ?? []).filter((member) => {
			if (roleFilter !== 'all' && member.role !== roleFilter) return false;
			if (!term) return true;
			return member.full_name.toLowerCase().includes(term) || !!member.email?.toLowerCase().includes(term);
		});
	}, [members, roleFilter, search]);

	const totals = useMemo(() => {
		const list = members ?? [];
		return {
			team: list.length,
			open: list.reduce((sum, member) => sum + member.open_quotes, 0),
			completed: list.reduce((sum, member) => sum + member.completed_quotes, 0),
			revenue: list.reduce((sum, member) => sum + member.completed_revenue, 0),
		};
	}, [members]);

	const columns = useMemo<ColumnDef<StaffMember>[]>(
		() => [
			{
				id: 'member',
				accessorKey: 'full_name',
				header: ({ column }) => <SortableHeader column={column} label="Member" />,
				cell: ({ row }) => (
					<div className="flex flex-col">
						<span className="font-medium text-foreground">
							{row.original.full_name}
							{row.original.id === user?.id && <span className="ml-1 text-muted-foreground">(you)</span>}
						</span>
						<span className="text-xs text-muted-foreground">{row.original.email ?? '-'}</span>
					</div>
				),
			},
			{
				id: 'role',
				accessorKey: 'role',
				header: 'Role',
				cell: ({ getValue }) => {
					const role = getStaffRole(getValue<StaffRole>());
					return <Badge variant={role.badgeVariant}>{role.label}</Badge>;
				},
			},
			{
				id: 'open',
				accessorKey: 'open_quotes',
				header: ({ column }) => <SortableHeader column={column} label="Open" />,
			},
			{
				id: 'completed',
				accessorKey: 'completed_quotes',
				header: ({ column }) => <SortableHeader column={column} label="Completed" />,
			},
			{
				id: 'completion_rate',
				accessorFn: (member) => getCompletionRate(member) ?? -1,
				header: ({ column }) => <SortableHeader column={column} label="Completion rate" />,
				cell: ({ getValue }) => {
					const value = getValue<number>();
					return value < 0 ? '-' : `${Math.round(value * 100)}%`;
				},
			},
			{
				id: 'revenue',
				accessorKey: 'completed_revenue',
				header: ({ column }) => <SortableHeader column={column} label="Revenue" />,
				cell: ({ getValue }) => formatCurrency(getValue<number>()),
			},
			{
				id: 'last_active',
				accessorFn: (member) => (member.last_sign_in_at ? new Date(member.last_sign_in_at).getTime() : 0),
				header: ({ column }) => <SortableHeader column={column} label="Last active" />,
				cell: ({ row }) =>
					row.original.last_sign_in_at
						? formatDistanceToNow(new Date(row.original.last_sign_in_at), { addSuffix: true })
						: 'Never',
			},
			{
				id: 'joined',
				accessorKey: 'created_at',
				header: ({ column }) => <SortableHeader column={column} label="Joined" />,
				sortingFn: 'datetime',
				cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
			},
			{
				id: 'actions',
				enableHiding: false,
				header: () => <div className="text-right">Actions</div>,
				cell: ({ row }) => {
					const member = row.original;
					const isSelf = member.id === user?.id;
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
									<DropdownMenuItem
										className="justify-between"
										onClick={() => navigate(`/dashboard/quotes?status=all&assigned=${member.id}`)}
									>
										View quotes <HugeiconsIcon icon={ListChecks} className="size-4" />
									</DropdownMenuItem>
									{!isSelf && (
										<>
											<DropdownMenuItem className="justify-between" onClick={() => setChangingRoleMember(member)}>
												Change role <HugeiconsIcon icon={UserSwitchIcon} className="size-4" />
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												variant="destructive"
												className="justify-between"
												onClick={() => setRemovingMember(member)}
											>
												Remove <HugeiconsIcon icon={UserRemove01Icon} className="size-4" />
											</DropdownMenuItem>
										</>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					);
				},
			},
		],
		[navigate, user?.id],
	);

	const table = useReactTable({
		data: filteredMembers,
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
					<h1 className="text-2xl font-bold text-foreground">Staff</h1>
					<Button onClick={() => setIsAdding(true)}>
						<HugeiconsIcon icon={UserAdd01Icon} className="size-4" />
						Add staff
					</Button>
				</div>

				{members && (
					<div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
						<StatCard label="Team members" value={String(totals.team)} hint="People with dashboard access" />
						<StatCard label="Open assignments" value={String(totals.open)} hint="Assigned quotes still in progress" />
						<StatCard label="Completed jobs" value={String(totals.completed)} hint="Assigned quotes marked completed" />
						<StatCard
							label="Completed revenue"
							value={formatCurrency(totals.revenue)}
							hint="Final price, or estimate if not set"
						/>
					</div>
				)}

				<div className="mb-4 flex flex-wrap gap-2">
					{ROLE_FILTER_TAGS.map((tag) => (
						<button key={tag.value} type="button" onClick={() => setRoleFilter(tag.value)}>
							<Badge
								variant={roleFilter === tag.value ? 'primary' : 'outline'}
								className={cn(roleFilter === tag.value && 'ring-2 ring-ring/30')}
							>
								{tag.label}
							</Badge>
						</button>
					))}
				</div>

				<div className="mb-6 flex items-center gap-2">
					<label htmlFor="staff-search" className="sr-only">
						Search staff
					</label>
					<Input
						id="staff-search"
						name="staff-search"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
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

				{isLoading && <p className="text-sm text-muted-foreground">Loading staff...</p>}
				{isError && <p className="text-sm text-destructive">Failed to load staff.</p>}
				{!isLoading && !isError && filteredMembers.length === 0 && (
					<p className="text-sm text-muted-foreground">No staff members found.</p>
				)}

				{!isLoading && !isError && filteredMembers.length > 0 && (
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

				{isAdding && <AddStaffDialog onOpenChange={(open) => !open && setIsAdding(false)} />}

				{changingRoleMember && (
					<ChangeStaffRoleDialog
						member={changingRoleMember}
						onOpenChange={(open) => !open && setChangingRoleMember(null)}
					/>
				)}

				{removingMember && (
					<RemoveStaffDialog member={removingMember} onOpenChange={(open) => !open && setRemovingMember(null)} />
				)}
			</div>
		</div>
	);
}
