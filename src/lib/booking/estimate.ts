import type { Tables } from '@/types/supabase';

export interface EstimateDetails {
	bedrooms: number;
	bathrooms: number;
	squareFootage: number;
	hasPets: boolean;
}

export function calculateEstimatedPrice(plan: Tables<'cleaning_plans'>, details: EstimateDetails): number {
	const { bedrooms, bathrooms, squareFootage, hasPets } = details;

	const estimate =
		plan.base_price +
		bedrooms * plan.price_per_bedroom +
		bathrooms * plan.price_per_bathroom +
		squareFootage * plan.price_per_sqft +
		(hasPets ? plan.pet_fee : 0);

	return Math.round(estimate * 100) / 100;
}
