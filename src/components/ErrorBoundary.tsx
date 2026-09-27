import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CHUNK_RELOAD_KEY = 'chunk-reload-at';
const CHUNK_RELOAD_COOLDOWN_MS = 10_000;

function isChunkLoadError(error: Error) {
	return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
		error.message,
	);
}

function tryReloadForChunkError() {
	try {
		const lastReload = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? 0);
		if (Date.now() - lastReload < CHUNK_RELOAD_COOLDOWN_MS) return false;
		sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
	} catch {
		return false;
	}
	window.location.reload();
	return true;
}

interface ErrorBoundaryState {
	hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
	state: ErrorBoundaryState = { hasError: false };

	static getDerivedStateFromError(): ErrorBoundaryState {
		return { hasError: true };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		if (isChunkLoadError(error) && tryReloadForChunkError()) return;
		console.error(error, info.componentStack);
	}

	render() {
		if (!this.state.hasError) return this.props.children;

		return (
			<div className="flex min-h-dvh items-center justify-center bg-background px-6 py-10">
				<Card className="w-full max-w-md">
					<CardContent className="flex flex-col items-center gap-3 py-6 text-center">
						<h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
						<p className="max-w-sm text-sm text-muted-foreground">
							An unexpected error occurred. Please reload the page. If the problem continues, contact us at
							aliancicleaning@gmail.com.
						</p>
						<Button variant="gradient" size="lg" className="mt-2" onClick={() => window.location.reload()}>
							Reload page
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}
}
