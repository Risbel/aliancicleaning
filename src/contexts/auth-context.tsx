import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type {
	requestPasswordReset as requestPasswordResetService,
	signInWithGoogle as signInWithGoogleService,
	signInWithPassword,
	signUpWithPassword,
	updatePassword as updatePasswordService,
} from '@/services/auth';

type AuthContextValue = {
	session: Session | null;
	user: User | null;
	loading: boolean;
	signIn: (email: string, password: string) => ReturnType<typeof signInWithPassword>;
	signUp: (email: string, password: string) => ReturnType<typeof signUpWithPassword>;
	signInWithGoogle: () => ReturnType<typeof signInWithGoogleService>;
	signOut: () => Promise<void>;
	requestPasswordReset: (email: string) => ReturnType<typeof requestPasswordResetService>;
	updatePassword: (password: string) => ReturnType<typeof updatePasswordService>;
};

const loadAuthService = () => import('@/services/auth');

const authActions = {
	signIn: async (email: string, password: string) => (await loadAuthService()).signInWithPassword(email, password),
	signUp: async (email: string, password: string) => (await loadAuthService()).signUpWithPassword(email, password),
	signInWithGoogle: async () => (await loadAuthService()).signInWithGoogle(),
	signOut: async () => (await loadAuthService()).signOut(),
	requestPasswordReset: async (email: string) => (await loadAuthService()).requestPasswordReset(email),
	updatePassword: async (password: string) => (await loadAuthService()).updatePassword(password),
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		let unsubscribe: (() => void) | undefined;

		import('@/lib/supabase/client').then(
			({ supabase }) => {
				if (cancelled) return;

				supabase.auth.getSession().then(({ data }) => {
					setSession(data.session);
					setLoading(false);
				});

				const {
					data: { subscription },
				} = supabase.auth.onAuthStateChange((_event, newSession) => {
					setSession(newSession);
				});

				unsubscribe = () => subscription.unsubscribe();
			},
			() => {
				if (!cancelled) setLoading(false);
			},
		);

		return () => {
			cancelled = true;
			unsubscribe?.();
		};
	}, []);

	const value: AuthContextValue = {
		session,
		user: session?.user ?? null,
		loading,
		...authActions,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
