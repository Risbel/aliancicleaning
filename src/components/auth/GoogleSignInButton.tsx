import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth/use-auth';

function GoogleIcon() {
	return (
		<svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
			<path
				fill="#4285F4"
				d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.76Z"
			/>
			<path
				fill="#34A853"
				d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.11C3.25 21.3 7.31 24 12 24Z"
			/>
			<path
				fill="#FBBC05"
				d="M5.27 14.28A7.19 7.19 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.61H1.27A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11Z"
			/>
			<path
				fill="#EA4335"
				d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.61l4 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
			/>
		</svg>
	);
}

export function GoogleSignInButton() {
	const { signInWithGoogle } = useAuth();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleClick() {
		setError(null);
		setLoading(true);
		try {
			await signInWithGoogle();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Something went wrong');
			setLoading(false);
		}
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-3">
				<div className="h-px flex-1 bg-border" />
				<span className="text-xs text-muted-foreground">OR</span>
				<div className="h-px flex-1 bg-border" />
			</div>

			<Button
				type="button"
				variant="outline"
				size="xl"
				className="text-primary"
				disabled={loading}
				onClick={handleClick}
			>
				<GoogleIcon />
				{loading ? 'Redirecting...' : 'Continue with Google'}
			</Button>

			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
}
