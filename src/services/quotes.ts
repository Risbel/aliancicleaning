import { supabase } from '@/lib/supabase/client';
import type { Database, Tables, TablesInsert, TablesUpdate } from '@/types/supabase';

export type QuoteStatusFilter = 'all' | 'expired' | Database['public']['Enums']['quote_status'];

export async function getQuotes(filter: { status: QuoteStatusFilter; search?: string }): Promise<Tables<'quotes'>[]> {
	let query = supabase.from('quotes').select('*').order('created_at', { ascending: false });
	const now = new Date().toISOString();

	if (filter.status === 'pending') {
		query = query.eq('status', 'pending').gte('desired_visit_date', now);
	} else if (filter.status === 'expired') {
		query = query.eq('status', 'pending').lt('desired_visit_date', now);
	} else if (filter.status !== 'all') {
		query = query.eq('status', filter.status);
	}

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
