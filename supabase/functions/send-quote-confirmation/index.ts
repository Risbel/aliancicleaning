import { createClient } from '@supabase/supabase-js';
import { render } from 'react-email';
import { createElement } from 'react';
import QuoteConfirmationEmail from './_templates/quote-confirmation.tsx';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});
}

function formatPrice(value: number | null) {
	return value != null ? `$${value.toFixed(2)}` : null;
}

async function buildEmail(quote: Record<string, unknown>, confirmationUrl: string, siteUrl: string) {
	const visitDate = new Date(quote.desired_visit_date as string).toLocaleString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	});
	const price = formatPrice(quote.final_price as number | null) ?? formatPrice(quote.estimated_price as number | null);

	const email = createElement(QuoteConfirmationEmail, {
		customerName: quote.customer_name as string,
		visitDate,
		address: quote.address_line as string,
		price,
		confirmationUrl,
		siteUrl,
	});

	const html = await render(email);
	const text = await render(email, { plainText: true });

	return { html, text };
}

Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response(null, { headers: corsHeaders });
	}

	const authHeader = req.headers.get('Authorization');
	if (!authHeader) return json({ error: 'Missing authorization header' }, 401);

	const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
	if (userError || !user) return json({ error: 'Invalid token' }, 401);

	const { data: staffProfile } = await supabase.from('staff_profiles').select('id').eq('id', user.id).maybeSingle();
	if (!staffProfile) return json({ error: 'Staff access required' }, 403);

	const { quoteId } = await req.json().catch(() => ({}));
	if (!quoteId) return json({ error: 'quoteId is required' }, 400);

	const { data: quote, error: quoteError } = await supabase.from('quotes').select('*').eq('id', quoteId).maybeSingle();
	if (quoteError) return json({ error: quoteError.message }, 500);
	if (!quote) return json({ error: 'Quote not found' }, 404);

	const updates: Record<string, unknown> = {};
	if (quote.status === 'pending' || quote.status === 'reviewed') updates.status = 'quoted';
	if (!quote.confirmation_token) updates.confirmation_token = crypto.randomUUID();

	let currentQuote = quote;
	if (Object.keys(updates).length > 0) {
		const { data: updated, error: updateError } = await supabase
			.from('quotes')
			.update(updates)
			.eq('id', quoteId)
			.select()
			.single();
		if (updateError) return json({ error: updateError.message }, 500);
		currentQuote = updated;
	}

	const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173';
	const confirmationUrl = `${siteUrl}/confirmation/${currentQuote.confirmation_token}`;
	const from = Deno.env.get('EMAIL_FROM') ?? 'Alianci Cleaning <onboarding@resend.dev>';
	const { html, text } = await buildEmail(currentQuote, confirmationUrl, siteUrl);

	const resendResponse = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from,
			to: [currentQuote.customer_email],
			subject: 'Your cleaning quote from Alianci Cleaning',
			html,
			text,
		}),
	});

	if (!resendResponse.ok) {
		const detail = await resendResponse.json().catch(() => null);
		return json({
			quote: currentQuote,
			emailSent: false,
			emailError: detail?.message ?? `Resend request failed with status ${resendResponse.status}`,
		});
	}

	return json({ quote: currentQuote, emailSent: true });
});
