export function formatCurrency(value: number) {
	return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCompactCurrency(value: number) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		notation: value >= 10_000 ? 'compact' : 'standard',
		maximumFractionDigits: value >= 10_000 ? 1 : 0,
	}).format(value);
}

export function formatCompactNumber(value: number) {
	return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}
