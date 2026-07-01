import { supabase } from '@/lib/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase';

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
