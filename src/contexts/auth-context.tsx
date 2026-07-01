import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { signInWithPassword, signOut as signOutService, signUpWithPassword } from '@/services/auth';

type AuthContextValue = {
	session: Session | null;
	user: User | null;
	loading: boolean;
	signIn: (email: string, password: string) => ReturnType<typeof signInWithPassword>;
	signUp: (email: string, password: string) => ReturnType<typeof signUpWithPassword>;
	signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		supabase.auth.getSession().then(({ data }) => {
			setSession(data.session);
			setLoading(false);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, newSession) => {
			setSession(newSession);
		});

		return () => subscription.unsubscribe();
	}, []);

	const value: AuthContextValue = {
		session,
		user: session?.user ?? null,
		loading,
		signIn: signInWithPassword,
		signUp: signUpWithPassword,
		signOut: signOutService,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
