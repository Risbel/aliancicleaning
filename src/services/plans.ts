import { supabase } from '@/lib/supabase/client';
import type { Tables } from '@/types/supabase';

export async function getActivePlans(): Promise<Tables<'cleaning_plans'>[]> {
	const { data, error } = await supabase
		.from('cleaning_plans')
		.select('*')
		.eq('is_active', true)
		.order('base_price', { ascending: true });

	if (error) throw error;
	return data;
}
