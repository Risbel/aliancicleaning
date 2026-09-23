import type { Enums } from '@/types/supabase';

const PLAN_IMAGES: Record<Enums<'cleaning_type'>, string> = {
	standard: '/vecteezy_cleaning_webp.webp',
	deep: '/deep_cleaning.webp',
	move_in_out: '/move_in_move_out.webp',
	other: '/cleaning_glasses.webp',
};

const FALLBACK_PLAN_IMAGE = '/vecteezy_cleaning_webp.webp';

export function getPlanImage(type: Enums<'cleaning_type'>): string {
	return PLAN_IMAGES[type] ?? FALLBACK_PLAN_IMAGE;
}
