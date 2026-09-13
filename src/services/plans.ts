import { supabase } from '@/lib/supabase/client';
import type { Tables, TablesUpdate } from '@/types/supabase';

export async function getActivePlans(): Promise<Tables<'cleaning_plans'>[]> {
	const { data, error } = await supabase
		.from('cleaning_plans')
		.select('*')
		.eq('is_active', true)
		.order('base_price', { ascending: true });

	if (error) throw error;
	return data;
}

export async function getAllPlans(): Promise<Tables<'cleaning_plans'>[]> {
	const { data, error } = await supabase.from('cleaning_plans').select('*').order('base_price', { ascending: true });

	if (error) throw error;
	return data;
}

export async function updatePlan(id: string, updates: TablesUpdate<'cleaning_plans'>): Promise<Tables<'cleaning_plans'>> {
	const { data, error } = await supabase.from('cleaning_plans').update(updates).eq('id', id).select().single();

	if (error) throw error;
	return data;
}
