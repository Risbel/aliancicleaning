import { render } from 'react-email';
import { createElement } from 'react';
import { Webhook } from 'standardwebhooks';
import ConfirmSignupEmail from './_templates/confirm-signup.tsx';
import ResetPasswordEmail from './_templates/reset-password.tsx';
import VerificationCodeEmail from './_templates/verification-code.tsx';

interface EmailData {
	token: string;
	token_hash: string;
	redirect_to: string;
	email_action_type: string;
	site_url: string;
	token_new: string;
	token_hash_new: string;
}

function json(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

function error(message: string, status: number) {
	return json({ error: { http_code: status, message } }, status);
}

function verifyUrl(tokenHash: string, type: string, redirectTo: string) {
	const params = new URLSearchParams({ token: tokenHash, type, redirect_to: redirectTo });
	return `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?${params.toString()}`;
}

function buildTemplate(emailData: EmailData, siteUrl: string) {
	const { email_action_type: type, redirect_to: redirectTo } = emailData;
	const redirect = redirectTo || siteUrl;

	if (type === 'reauthentication') {
		return {
			subject: 'Your Alianci Cleaning verification code',
			element: createElement(VerificationCodeEmail, { code: emailData.token, siteUrl }),
		};
	}

	const isNewEmail = type === 'email_change_new';
	const tokenHash = isNewEmail ? emailData.token_hash_new : emailData.token_hash;
	const url = verifyUrl(tokenHash, isNewEmail ? 'email_change' : type, redirect);

	if (type === 'recovery') {
		return {
			subject: 'Reset your Alianci Cleaning password',
			element: createElement(ResetPasswordEmail, { resetUrl: url, siteUrl }),
		};
	}

	if (type === 'invite') {
		return {
			subject: 'You have been invited to Alianci Cleaning',
			element: createElement(ConfirmSignupEmail, {
				confirmUrl: url,
				siteUrl,
				preview: 'Accept your invitation to Alianci Cleaning',
				heading: 'You have been invited',
				intro: 'You have been invited to create an account on Alianci Cleaning. Accept the invitation to set up your account.',
				buttonLabel: 'Accept the invitation',
				disclaimer: 'If you were not expecting this invitation, you can safely ignore this email.',
			}),
		};
	}

	if (type === 'magiclink') {
		return {
			subject: 'Your Alianci Cleaning sign-in link',
			element: createElement(ConfirmSignupEmail, {
				confirmUrl: url,
				siteUrl,
				preview: 'Your sign-in link for Alianci Cleaning',
				heading: 'Sign in to your account',
				intro: 'Use the link below to sign in to your Alianci Cleaning account. This link expires in one hour and can only be used once.',
				buttonLabel: 'Sign in',
				disclaimer: 'If you did not try to sign in, you can safely ignore this email.',
			}),
		};
	}

	if (type === 'email_change' || type === 'email_change_current' || type === 'email_change_new') {
		return {
			subject: 'Confirm your new email address',
			element: createElement(ConfirmSignupEmail, {
				confirmUrl: url,
				siteUrl,
				preview: 'Confirm the change to your email address',
				heading: 'Confirm your new email',
				intro: 'We received a request to change the email address on your Alianci Cleaning account. Confirm the change using the link below.',
				buttonLabel: 'Confirm the change',
				disclaimer: 'If you did not request this change, ignore this email and contact us so we can secure your account.',
			}),
		};
	}

	return {
		subject: 'Confirm your email for Alianci Cleaning',
		element: createElement(ConfirmSignupEmail, { confirmUrl: url, siteUrl }),
	};
}

Deno.serve(async (req) => {
	if (req.method !== 'POST') return error('Method not allowed', 405);

	const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET');
	if (!hookSecret) return error('SEND_EMAIL_HOOK_SECRET is not set', 500);

	const payload = await req.text();
	const headers = Object.fromEntries(req.headers);

	let user: { email: string };
	let emailData: EmailData;
	try {
		const webhook = new Webhook(hookSecret.replace('v1,', ''));
		const verified = webhook.verify(payload, headers) as { user: { email: string }; email_data: EmailData };
		user = verified.user;
		emailData = verified.email_data;
	} catch {
		return error('Invalid webhook signature', 401);
	}

	const siteUrl = Deno.env.get('SITE_URL') ?? emailData.site_url ?? 'http://localhost:5173';
	const from = Deno.env.get('EMAIL_FROM') ?? 'Alianci Cleaning <onboarding@resend.dev>';
	const { subject, element } = buildTemplate(emailData, siteUrl);

	const html = await render(element);
	const text = await render(element, { plainText: true });

	const resendResponse = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ from, to: [user.email], subject, html, text }),
	});

	if (!resendResponse.ok) {
		const detail = await resendResponse.json().catch(() => null);
		return error(detail?.message ?? `Resend request failed with status ${resendResponse.status}`, 502);
	}

	return json({});
});
