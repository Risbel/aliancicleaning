import { supabase } from '@/lib/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase';

export async function getPublishedReviews(): Promise<Tables<'reviews'>[]> {
	const { data, error } = await supabase
		.from('reviews')
		.select('*')
		.eq('is_published', true)
		.order('sort_order', { ascending: true })
		.order('created_at', { ascending: false });

	if (error) throw error;
	return data;
}

export async function getAllReviews(): Promise<Tables<'reviews'>[]> {
	const { data, error } = await supabase
		.from('reviews')
		.select('*')
		.order('sort_order', { ascending: true })
		.order('created_at', { ascending: false });

	if (error) throw error;
	return data;
}

export async function createReview(review: TablesInsert<'reviews'>): Promise<Tables<'reviews'>> {
	const { data, error } = await supabase.from('reviews').insert(review).select().single();

	if (error) throw error;
	return data;
}

export async function updateReview(id: string, updates: TablesUpdate<'reviews'>): Promise<Tables<'reviews'>> {
	const { data, error } = await supabase.from('reviews').update(updates).eq('id', id).select().single();

	if (error) throw error;
	return data;
}

export async function deleteReview(id: string): Promise<void> {
	const { error } = await supabase.from('reviews').delete().eq('id', id);

	if (error) throw error;
}
