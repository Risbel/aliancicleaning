import { supabase } from '@/lib/supabase/client';
import type { Database, Tables } from '@/types/supabase';

type Functions = Database['public']['Functions'];

export type StaffRole = Database['public']['Enums']['staff_role'];

export type StaffMember = Omit<
	Functions['get_staff_members']['Returns'][number],
	'email' | 'last_sign_in_at' | 'last_assigned_at'
> & {
	email: string | null;
	last_sign_in_at: string | null;
	last_assigned_at: string | null;
};

export type UserLookupResult = Functions['find_user_by_email']['Returns'][number];

export async function getStaffMembers(): Promise<StaffMember[]> {
	const { data, error } = await supabase.rpc('get_staff_members');

	if (error) throw error;
	return data;
}

export async function findUserByEmail(email: string): Promise<UserLookupResult | null> {
	const { data, error } = await supabase.rpc('find_user_by_email', { p_email: email });

	if (error) throw error;
	return data?.[0] ?? null;
}

export async function addStaffMember(userId: string, role: StaffRole): Promise<Tables<'staff_profiles'>> {
	const { data, error } = await supabase.rpc('add_staff_member', { p_user_id: userId, p_role: role });

	if (error) throw error;
	return data;
}

export async function setStaffRole(userId: string, role: StaffRole): Promise<Tables<'staff_profiles'>> {
	const { data, error } = await supabase.rpc('set_staff_role', { p_user_id: userId, p_role: role });

	if (error) throw error;
	return data;
}

export async function removeStaffMember(userId: string): Promise<void> {
	const { error } = await supabase.rpc('remove_staff_member', { p_user_id: userId });

	if (error) throw error;
}
