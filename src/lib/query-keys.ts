export const planKeys = {
	all: ['plans'] as const,
	lists: () => [...planKeys.all, 'list'] as const,
	adminList: () => [...planKeys.all, 'admin-list'] as const,
};

export const quoteKeys = {
	all: ['quotes'] as const,
	lists: () => [...quoteKeys.all, 'list'] as const,
	listByCustomer: (customerId: string) => [...quoteKeys.lists(), { customerId }] as const,
	byFilter: (filter: { status: string; search?: string; customerId?: string }) =>
		[...quoteKeys.lists(), 'staff', filter] as const,
	detail: (id: string) => [...quoteKeys.all, 'detail', id] as const,
	byConfirmationToken: (token: string) => [...quoteKeys.all, 'confirmation', token] as const,
};

export const customerKeys = {
	all: ['customers'] as const,
	lists: () => [...customerKeys.all, 'list'] as const,
	byFilter: (filter: { type: string; search?: string }) => [...customerKeys.lists(), filter] as const,
	accounts: () => [...customerKeys.lists(), 'accounts'] as const,
	detail: (id: string) => [...customerKeys.all, 'detail', id] as const,
};

export const profileKeys = {
	all: ['profiles'] as const,
	customer: (userId: string) => [...profileKeys.all, 'customer', userId] as const,
	staff: (userId: string) => [...profileKeys.all, 'staff', userId] as const,
	staffList: () => [...profileKeys.all, 'staff-list'] as const,
};

export const staffKeys = {
	all: ['staff'] as const,
	lists: () => [...staffKeys.all, 'list'] as const,
	lookup: (email: string) => [...staffKeys.all, 'lookup', email] as const,
};
