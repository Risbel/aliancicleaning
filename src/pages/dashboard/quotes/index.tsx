import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	ChevronLeftIcon,
	InformationCircleIcon,
	ListChecks,
	LoaderCircle,
	MoreHorizontalIcon,
	Pen,
	RadioButtonFreeIcons,
	RadioButtonIcon,
	RefreshCw,
	Send,
	Trash,
	UserCheck,
} from '@hugeicons/core-free-icons';
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
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
import { useAuth } from '@/hooks/auth/use-auth';
import { useStaffProfile } from '@/hooks/queries/use-profile';
import { useDeleteQuote, useQuotes, useUpdateQuote } from '@/hooks/queries/use-quotes';
import { cn } from '@/lib/utils';
import { QUOTE_FILTER_TAGS, QUOTE_STATUS_BADGE_VARIANT, type QuoteStatus } from '@/lib/quote-status';
import type { QuoteStatusFilter } from '@/services/quotes';
import type { Tables, TablesUpdate } from '@/types/supabase';
import { buttonVariants } from '@/components/ui/button-variants';

function displayStatus(quote: Tables<'quotes'>): QuoteStatusFilter {
	if (quote.status === 'pending' && new Date(quote.desired_visit_date) < new Date()) return 'expired';
	return quote.status;
}

export default function DashboardQuotesPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const status = (searchParams.get('status') as QuoteStatusFilter) || 'pending';
	const search = searchParams.get('q') ?? '';

	const [searchInput, setSearchInput] = useState(search);

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
	const [confirmationSent, setConfirmationSent] = useState(false);
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

	async function handleSendConfirmation(quote: Tables<'quotes'>) {
		const updates: TablesUpdate<'quotes'> = {};
		if (quote.status === 'pending' || quote.status === 'reviewed') updates.status = 'quoted';
		if (!quote.confirmation_token) updates.confirmation_token = crypto.randomUUID();

		try {
			const updated =
				Object.keys(updates).length > 0 ? await updateQuote.mutateAsync({ id: quote.id, updates }) : quote;
			toast('Confirmation ready to send.');
			setConfirmationQuote(updated);
			setConfirmationSent(true);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to prepare confirmation.');
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

				<Input
					value={searchInput}
					onChange={(event) => handleSearchChange(event.target.value)}
					placeholder="Search by name or email"
					className="mb-6 max-w-sm"
				/>

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
					<div className="rounded-lg border border-input">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Customer</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Phone</TableHead>
									<TableHead>Plan</TableHead>
									<TableHead>Desired visit</TableHead>
									<TableHead>Estimated price</TableHead>
									<TableHead>Final price</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{quotes.map((quote) => (
									<TableRow key={quote.id}>
										<TableCell>{quote.customer_name}</TableCell>
										<TableCell>{quote.customer_email}</TableCell>
										<TableCell>{quote.customer_phone}</TableCell>
										<TableCell>{quote.cleaning_plans?.name ?? '-'}</TableCell>
										<TableCell>{new Date(quote.desired_visit_date).toLocaleDateString()}</TableCell>
										<TableCell>
											{quote.estimated_price != null ? `$${quote.estimated_price.toFixed(2)}` : '-'}
										</TableCell>
										<TableCell>{quote.final_price != null ? `$${quote.final_price.toFixed(2)}` : '-'}</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Badge variant={QUOTE_STATUS_BADGE_VARIANT[displayStatus(quote)]}>{displayStatus(quote)}</Badge>
												{updateQuote.isPending && updateQuote.variables?.id === quote.id && (
													<HugeiconsIcon icon={LoaderCircle} className="size-4 animate-spin" />
												)}
											</div>
										</TableCell>
										<TableCell>{new Date(quote.created_at).toLocaleDateString()}</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon-sm">
														<HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
														<span className="sr-only">Open menu</span>
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem className="justify-between" onClick={() => setEditingQuote(quote)}>
														Edit <HugeiconsIcon icon={Pen} className="size-4" />
													</DropdownMenuItem>
													<DropdownMenuItem className="justify-between" onClick={() => setChangingStatusQuote(quote)}>
														Change status <HugeiconsIcon icon={RadioButtonFreeIcons} className="size-4" />
													</DropdownMenuItem>
													<DropdownMenuItem
														disabled={quote.final_price == null || quote.status === 'accepted'}
														onClick={() => {
															setConfirmationQuote(quote);
															setConfirmationSent(false);
														}}
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
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
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

				<Dialog
					open={!!confirmationQuote}
					onOpenChange={(open) => {
						if (!open) {
							setConfirmationQuote(null);
							setConfirmationSent(false);
						}
					}}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Send confirmation</DialogTitle>
							<DialogDescription>
								{confirmationQuote?.customer_name} &middot; {confirmationQuote?.customer_email}
							</DialogDescription>
						</DialogHeader>

						{confirmationQuote && (
							<div className="rounded-lg border border-input p-4 text-sm">
								<div className="flex justify-between py-1">
									<span className="text-muted-foreground">Desired visit</span>
									<span className="font-medium text-foreground">
										{new Date(confirmationQuote.desired_visit_date).toLocaleDateString()}
									</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-muted-foreground">Address</span>
									<span className="font-medium text-foreground">{confirmationQuote.address_line}</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-muted-foreground">Estimated price</span>
									<span className="font-medium text-foreground">
										{confirmationQuote.estimated_price != null
											? `$${confirmationQuote.estimated_price.toFixed(2)}`
											: '-'}
									</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-muted-foreground">Final price</span>
									<span className="font-medium text-foreground">
										{confirmationQuote.final_price != null ? `$${confirmationQuote.final_price.toFixed(2)}` : '-'}
									</span>
								</div>
							</div>
						)}

						{confirmationSent ? (
							<>
								<p className="text-sm text-muted-foreground">
									Email sending isn't set up yet, so share this confirmation link with the client manually:
								</p>
								<Input
									readOnly
									value={
										confirmationQuote
											? `${window.location.origin}/confirmation/${confirmationQuote.confirmation_token}`
											: ''
									}
									onFocus={(event) => event.target.select()}
								/>
								<DialogFooter>
									<Button
										type="button"
										onClick={() => {
											setConfirmationQuote(null);
											setConfirmationSent(false);
										}}
									>
										Done
									</Button>
								</DialogFooter>
							</>
						) : (
							<DialogFooter>
								<Button type="button" variant="outline" onClick={() => setConfirmationQuote(null)}>
									Cancel
								</Button>
								<Button
									className="space-x-3"
									type="button"
									onClick={() => confirmationQuote && handleSendConfirmation(confirmationQuote)}
									disabled={updateQuote.isPending}
								>
									{updateQuote.isPending ? 'Sending...' : 'Send'} <HugeiconsIcon icon={Send} className="size-4" />
								</Button>
							</DialogFooter>
						)}
					</DialogContent>
				</Dialog>

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
