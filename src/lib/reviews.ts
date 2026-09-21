export function getReviewInitials(name: string) {
	const parts = name
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? '');

	return parts.join('') || '?';
}
