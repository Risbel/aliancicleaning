import { createClient } from '@supabase/supabase-js';

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

function buildEmail(quote: Record<string, unknown>, confirmationUrl: string) {
	const name = quote.customer_name as string;
	const visitDate = new Date(quote.desired_visit_date as string).toLocaleString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	});
	const address = quote.address_line as string;
	const price = formatPrice(quote.final_price as number | null) ?? formatPrice(quote.estimated_price as number | null);

	const rows = [
		['Visit date', visitDate],
		['Address', address],
		...(price ? [['Price', price]] : []),
	]
		.map(
			([label, value]) => `
				<tr>
					<td style="padding: 8px 0; color: #6b7a86; font-size: 14px;">${label}</td>
					<td style="padding: 8px 0; color: #1a2e3f; font-size: 14px; font-weight: 600; text-align: right;">${value}</td>
				</tr>`,
		)
		.join('');

	const html = `
		<div style="background-color: #f2f2f2; padding: 32px 16px; font-family: Arial, Helvetica, sans-serif;">
			<div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
				<div style="background: linear-gradient(135deg, #156390 0%, #54a8d0 100%); padding: 28px 32px;">
					<h1 style="margin: 0; color: #ffffff; font-size: 22px;">Alianci Cleaning</h1>
				</div>
				<div style="padding: 32px;">
					<p style="margin: 0 0 16px; color: #1a2e3f; font-size: 16px;">Hi ${name},</p>
					<p style="margin: 0 0 24px; color: #1a2e3f; font-size: 15px; line-height: 1.6;">
						Your cleaning quote is ready. Review the details below and confirm your booking.
					</p>
					<table style="width: 100%; border-collapse: collapse; border-top: 1px solid #cbe0ea; border-bottom: 1px solid #cbe0ea; margin-bottom: 28px;">
						${rows}
					</table>
					<div style="text-align: center; margin-bottom: 28px;">
						<a href="${confirmationUrl}" style="display: inline-block; background-color: #156390; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 32px; border-radius: 8px;">
							Confirm your booking
						</a>
					</div>
					<p style="margin: 0; color: #6b7a86; font-size: 13px; line-height: 1.6;">
						If the button does not work, copy and paste this link into your browser:<br />
						<a href="${confirmationUrl}" style="color: #156390; word-break: break-all;">${confirmationUrl}</a>
					</p>
				</div>
			</div>
		</div>`;

	const text = [
		`Hi ${name},`,
		'',
		'Your cleaning quote is ready. Review the details below and confirm your booking.',
		'',
		`Visit date: ${visitDate}`,
		`Address: ${address}`,
		...(price ? [`Price: ${price}`] : []),
		'',
		`Confirm your booking: ${confirmationUrl}`,
	].join('\n');

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
	const { html, text } = buildEmail(currentQuote, confirmationUrl);

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
