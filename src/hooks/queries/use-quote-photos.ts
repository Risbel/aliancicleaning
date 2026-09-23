import { useQuery } from '@tanstack/react-query';
import { quoteKeys } from '@/lib/query-keys';
import { getQuotePhotos } from '@/services/quote-photos';

export function useQuotePhotos(quoteId: string | undefined) {
	return useQuery({
		queryKey: quoteKeys.photos(quoteId ?? ''),
		queryFn: () => getQuotePhotos(quoteId!),
		enabled: !!quoteId,
	});
}
