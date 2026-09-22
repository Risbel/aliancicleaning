import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircleIcon, CheckmarkCircle02Icon, Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/auth/use-auth';
import { usePageMeta } from '@/hooks/usePageMeta';
import { resetPasswordSchema, type ResetPasswordValues } from '@/lib/validation/auth-schemas';

function readLinkError() {
	const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
	if (!params.get('error')) return null;
	return params.get('error_description')?.replace(/\+/g, ' ') ?? 'This link is no longer valid.';
}

export default function ResetPasswordPage() {
	const { session, loading, updatePassword } = useAuth();
	const navigate = useNavigate();
	const [linkError] = useState(readLinkError);
	const [serverError, setServerError] = useState<string | null>(null);
	const [done, setDone] = useState(false);

	usePageMeta({
		title: 'Choose a New Password | Alianci Cleaning',
		description: 'Choose a new password for your Alianci Cleaning account.',
		path: '/reset-password',
		noIndex: true,
	});

	const form = useForm<ResetPasswordValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { password: '', confirmPassword: '' },
	});

	async function onSubmit(values: ResetPasswordValues) {
		setServerError(null);
		try {
			await updatePassword(values.password);
			setDone(true);
		} catch (err) {
			setServerError(err instanceof Error ? err.message : 'Something went wrong');
		}
	}

	if (done) {
		return (
			<AuthLayout title="Password updated">
				<div className="flex flex-col items-center gap-4 text-center">
					<span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
						<HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-7" />
					</span>
					<p className="text-sm text-muted-foreground">
						Your password has been changed and you are signed in. Use the new password the next time you sign in.
					</p>
				</div>

				<Button
					type="button"
					variant="gradient"
					size="xl"
					className="mt-6 w-full"
					onClick={() => navigate('/booking', { replace: true })}
				>
					Continue
				</Button>
			</AuthLayout>
		);
	}

	if (loading) {
		return (
			<AuthLayout title="Reset your password">
				<div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
					<HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
					Checking your link...
				</div>
			</AuthLayout>
		);
	}

	if (linkError || !session) {
		return (
			<AuthLayout title="Link expired">
				<div className="flex flex-col items-center gap-4 text-center">
					<span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
						<HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-7" />
					</span>
					<p className="text-sm text-muted-foreground">
						{linkError ?? 'This password reset link is invalid or has already been used.'}
					</p>
					<p className="text-sm text-muted-foreground">Request a new link to choose your password.</p>
				</div>

				<Button asChild variant="gradient" size="xl" className="mt-6 w-full">
					<Link to="/forgot-password">Request a new link</Link>
				</Button>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					<Link to="/login" className="text-primary underline-offset-4 hover:underline">
						Back to sign in
					</Link>
				</p>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout title="Choose a new password">
			<p className="mb-6 text-sm text-muted-foreground">
				Pick a password you have not used on this account before.
			</p>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>New password</FormLabel>
								<FormControl>
									<PasswordInput autoComplete="new-password" placeholder="••••••••" {...field} />
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
								<FormLabel>Confirm new password</FormLabel>
								<FormControl>
									<PasswordInput autoComplete="new-password" placeholder="••••••••" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{serverError && <p className="text-sm text-destructive">{serverError}</p>}

					<Button
						type="submit"
						variant="gradient"
						size="xl"
						className="mt-2 w-full"
						disabled={form.formState.isSubmitting}
					>
						{form.formState.isSubmitting ? 'Saving password...' : 'Save new password'}
					</Button>
				</form>
			</Form>
		</AuthLayout>
	);
}
