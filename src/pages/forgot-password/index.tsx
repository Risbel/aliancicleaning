import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { MailCheckIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/auth/use-auth';
import { usePageMeta } from '@/hooks/usePageMeta';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/lib/validation/auth-schemas';

export default function ForgotPasswordPage() {
	const { requestPasswordReset } = useAuth();
	const [sentTo, setSentTo] = useState<string | null>(null);
	const [serverError, setServerError] = useState<string | null>(null);

	usePageMeta({
		title: 'Reset Password | Alianci Cleaning',
		description: 'Request a link to reset the password on your Alianci Cleaning account.',
		path: '/forgot-password',
		noIndex: true,
	});

	const form = useForm<ForgotPasswordValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { email: '' },
	});

	async function onSubmit(values: ForgotPasswordValues) {
		setServerError(null);
		try {
			await requestPasswordReset(values.email);
			setSentTo(values.email);
		} catch (err) {
			setServerError(err instanceof Error ? err.message : 'Something went wrong');
		}
	}

	if (sentTo) {
		return (
			<AuthLayout title="Check your email">
				<div className="flex flex-col items-center gap-4 text-center">
					<span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
						<HugeiconsIcon icon={MailCheckIcon} strokeWidth={2} className="size-7" />
					</span>
					<p className="text-sm text-muted-foreground">
						If an account exists for <span className="font-medium text-foreground">{sentTo}</span>, we sent a link to
						reset the password. The link expires in one hour.
					</p>
					<p className="text-sm text-muted-foreground">
						Nothing in your inbox? Check the spam folder before requesting another link.
					</p>
				</div>

				<Button
					type="button"
					variant="outline"
					size="xl"
					className="mt-6 w-full"
					onClick={() => {
						setSentTo(null);
						form.reset({ email: sentTo });
					}}
				>
					Use a different email
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
		<AuthLayout title="Reset your password">
			<p className="mb-6 text-sm text-muted-foreground">
				Enter the email on your account and we will send you a link to choose a new password.
			</p>

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

					{serverError && <p className="text-sm text-destructive">{serverError}</p>}

					<Button
						type="submit"
						variant="gradient"
						size="xl"
						className="mt-2 w-full"
						disabled={form.formState.isSubmitting}
					>
						{form.formState.isSubmitting ? 'Sending link...' : 'Send reset link'}
					</Button>
				</form>
			</Form>

			<p className="mt-6 text-center text-sm text-muted-foreground">
				Remembered it?{' '}
				<Link to="/login" className="text-primary underline-offset-4 hover:underline">
					Back to sign in
				</Link>
			</p>
		</AuthLayout>
	);
}
