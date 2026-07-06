import { supabase } from '@/lib/supabase/client';
import type { Database, Tables, TablesInsert, TablesUpdate } from '@/types/supabase';

export type QuoteStatusFilter = 'all' | 'expired' | Database['public']['Enums']['quote_status'];

export type QuoteWithPlan = Tables<'quotes'> & {
	cleaning_plans: Pick<Tables<'cleaning_plans'>, 'name'> | null;
};

export async function getQuotes(filter: {
	status: QuoteStatusFilter;
	search?: string;
	assignedTo?: string;
}): Promise<QuoteWithPlan[]> {
	let query = supabase.from('quotes').select('*, cleaning_plans(name)').order('created_at', { ascending: false });
	const now = new Date().toISOString();

	if (filter.status === 'pending') {
		query = query.eq('status', 'pending').gte('desired_visit_date', now);
	} else if (filter.status === 'expired') {
		query = query.eq('status', 'pending').lt('desired_visit_date', now);
	} else if (filter.status !== 'all') {
		query = query.eq('status', filter.status);
	}

	if (filter.assignedTo) query = query.eq('assigned_to', filter.assignedTo);

	if (filter.search) {
		const term = filter.search.replace(/[,%]/g, '');
		if (term) query = query.or(`customer_name.ilike.%${term}%,customer_email.ilike.%${term}%`);
	}

	const { data, error } = await query;
	if (error) throw error;
	return data;
}

export async function getQuotesByCustomer(customerId: string): Promise<Tables<'quotes'>[]> {
	const { data, error } = await supabase
		.from('quotes')
		.select('*')
		.eq('customer_id', customerId)
		.order('created_at', { ascending: false });

	if (error) throw error;
	return data;
}

export async function getQuote(id: string): Promise<Tables<'quotes'> | null> {
	const { data, error } = await supabase.from('quotes').select('*').eq('id', id).maybeSingle();

	if (error) throw error;
	return data;
}

export async function createQuote(quote: TablesInsert<'quotes'>): Promise<Tables<'quotes'>> {
	const { data, error } = await supabase.from('quotes').insert(quote).select().single();

	if (error) throw error;
	return data;
}

export async function updateQuote(id: string, updates: TablesUpdate<'quotes'>): Promise<Tables<'quotes'>> {
	const { data, error } = await supabase.from('quotes').update(updates).eq('id', id).select().single();

	if (error) throw error;
	return data;
}

export async function deleteQuote(id: string): Promise<void> {
	const { error } = await supabase.from('quotes').delete().eq('id', id);

	if (error) throw error;
}

export async function getQuoteByConfirmationToken(token: string): Promise<Tables<'quotes'> | null> {
	const { data, error } = await supabase.rpc('get_quote_by_confirmation_token', { p_token: token });

	if (error) throw error;
	return data?.[0] ?? null;
}

export async function acceptQuoteByConfirmationToken(token: string): Promise<Tables<'quotes'> | null> {
	const { data, error } = await supabase.rpc('accept_quote_by_confirmation_token', { p_token: token });

	if (error) throw error;
	return data?.[0] ?? null;
}
