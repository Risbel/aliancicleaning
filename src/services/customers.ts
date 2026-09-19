import { supabase } from '@/lib/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase';

export type CustomerTypeFilter = 'all' | 'account' | 'manual';

export type CustomerWithQuoteCount = Tables<'customer_profiles'> & {
	quotes: { count: number }[];
};

export async function getCustomers(filter: {
	type: CustomerTypeFilter;
	search?: string;
}): Promise<CustomerWithQuoteCount[]> {
	let query = supabase.from('customer_profiles').select('*, quotes(count)').order('created_at', { ascending: false });

	if (filter.type === 'account') query = query.not('user_id', 'is', null);
	if (filter.type === 'manual') query = query.is('user_id', null);

	if (filter.search) {
		const term = filter.search.replace(/[,%]/g, '');
		if (term) query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`);
	}

	const { data, error } = await query;
	if (error) throw error;
	return data;
}

export async function getAccountCustomers(): Promise<Tables<'customer_profiles'>[]> {
	const { data, error } = await supabase
		.from('customer_profiles')
		.select('*')
		.not('user_id', 'is', null)
		.order('full_name');

	if (error) throw error;
	return data;
}

export async function getCustomer(id: string): Promise<Tables<'customer_profiles'> | null> {
	const { data, error } = await supabase.from('customer_profiles').select('*').eq('id', id).maybeSingle();

	if (error) throw error;
	return data;
}

export async function createCustomer(
	customer: TablesInsert<'customer_profiles'>,
): Promise<Tables<'customer_profiles'>> {
	const { data, error } = await supabase.from('customer_profiles').insert(customer).select().single();

	if (error) throw error;
	return data;
}

export async function updateCustomer(
	id: string,
	updates: TablesUpdate<'customer_profiles'>,
): Promise<Tables<'customer_profiles'>> {
	const { data, error } = await supabase.from('customer_profiles').update(updates).eq('id', id).select().single();

	if (error) throw error;
	return data;
}

export async function mergeCustomers(sourceId: string, targetId: string): Promise<Tables<'customer_profiles'>> {
	const { data, error } = await supabase.rpc('merge_customer_profiles', { p_source: sourceId, p_target: targetId });

	if (error) throw error;
	return data;
}
