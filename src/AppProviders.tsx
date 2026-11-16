import { StrictMode, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<StrictMode>
			<ErrorBoundary>
				<QueryClientProvider client={queryClient}>
					<AuthProvider>{children}</AuthProvider>
					<ReactQueryDevtools initialIsOpen={false} />
					<Toaster />
				</QueryClientProvider>
			</ErrorBoundary>
		</StrictMode>
	);
}
