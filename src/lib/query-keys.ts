export const planKeys = {
	all: ['plans'] as const,
	lists: () => [...planKeys.all, 'list'] as const,
};

export const quoteKeys = {
	all: ['quotes'] as const,
	lists: () => [...quoteKeys.all, 'list'] as const,
	listByCustomer: (customerId: string) => [...quoteKeys.lists(), { customerId }] as const,
	byFilter: (filter: { status: string; search?: string }) => [...quoteKeys.lists(), 'staff', filter] as const,
	detail: (id: string) => [...quoteKeys.all, 'detail', id] as const,
};

export const profileKeys = {
	all: ['profiles'] as const,
	customer: (userId: string) => [...profileKeys.all, 'customer', userId] as const,
	staff: (userId: string) => [...profileKeys.all, 'staff', userId] as const,
};
