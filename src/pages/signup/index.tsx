import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/auth/use-auth';
import { signupSchema, type SignupValues } from '@/lib/validation/auth-schemas';

export default function SignupPage() {
	const { signUp } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [serverError, setServerError] = useState<string | null>(null);

	const from = (location.state as { from?: string } | null)?.from ?? '/booking';

	const form = useForm<SignupValues>({
		resolver: zodResolver(signupSchema),
		defaultValues: { email: '', password: '', confirmPassword: '' },
	});

	async function onSubmit(values: SignupValues) {
		setServerError(null);
		try {
			await signUp(values.email, values.password);
			navigate(from, { replace: true });
		} catch (err) {
			setServerError(err instanceof Error ? err.message : 'Something went wrong');
		}
	}

	return (
		<AuthLayout title="Create your account">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input type="password" autoComplete="new-password" placeholder="••••••••" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Confirm password</FormLabel>
								<FormControl>
									<Input type="password" autoComplete="new-password" placeholder="••••••••" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{serverError && <p className="text-sm text-destructive">{serverError}</p>}

					<Button type="submit" variant="gradient" size="xl" className="mt-2 w-full" disabled={form.formState.isSubmitting}>
						{form.formState.isSubmitting ? 'Creating account...' : 'Sign up'}
					</Button>
				</form>
			</Form>

			<p className="mt-6 text-center text-sm text-muted-foreground">
				Already have an account?{' '}
				<Link to="/login" state={location.state} className="text-primary underline-offset-4 hover:underline">
					Sign in
				</Link>
			</p>
		</AuthLayout>
	);
}
