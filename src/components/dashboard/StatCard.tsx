import type { ReactNode } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function StatCard({
	label,
	value,
	hint,
	className,
}: {
	label: string;
	value: string;
	hint: ReactNode;
	className?: string;
}) {
	return (
		<Card size="sm" className={className}>
			<CardHeader>
				<CardDescription>{label}</CardDescription>
				<CardTitle className="text-2xl font-bold">{value}</CardTitle>
				<p className="text-xs text-muted-foreground">{hint}</p>
			</CardHeader>
		</Card>
	);
}
