import { supabase } from '@/lib/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase';

export async function getCustomerProfile(userId: string): Promise<Tables<'customer_profiles'> | null> {
	const { data, error } = await supabase.from('customer_profiles').select('*').eq('id', userId).maybeSingle();

	if (error) throw error;
	return data;
}

export async function createCustomerProfile(
	profile: TablesInsert<'customer_profiles'>,
): Promise<Tables<'customer_profiles'>> {
	const { data, error } = await supabase.from('customer_profiles').insert(profile).select().single();

	if (error) throw error;
	return data;
}

export async function upsertCustomerProfile(
	profile: TablesInsert<'customer_profiles'>,
): Promise<Tables<'customer_profiles'>> {
	const { data, error } = await supabase
		.from('customer_profiles')
		.upsert(profile, { onConflict: 'id' })
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function updateCustomerProfile(
	userId: string,
	updates: TablesUpdate<'customer_profiles'>,
): Promise<Tables<'customer_profiles'>> {
	const { data, error } = await supabase.from('customer_profiles').update(updates).eq('id', userId).select().single();

	if (error) throw error;
	return data;
}

export async function getStaffProfile(userId: string): Promise<Tables<'staff_profiles'> | null> {
	const { data, error } = await supabase.from('staff_profiles').select('*').eq('id', userId).maybeSingle();

	if (error) throw error;
	return data;
}

export async function getStaffProfiles(): Promise<Tables<'staff_profiles'>[]> {
	const { data, error } = await supabase.from('staff_profiles').select('*').order('full_name');

	if (error) throw error;
	return data;
}
