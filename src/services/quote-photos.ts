import { supabase } from '@/lib/supabase/client';
import type { PendingQuotePhoto } from '@/lib/booking/photo-compression';
import type { Tables } from '@/types/supabase';

const QUOTE_PHOTOS_BUCKET = 'quote-photos';
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export type QuotePhotoWithUrl = Tables<'quote_photos'> & { url: string | null };

export async function uploadQuotePhotos(
	quoteId: string,
	photos: PendingQuotePhoto[],
): Promise<Tables<'quote_photos'>[]> {
	if (!photos.length) return [];

	const rows = await Promise.all(
		photos.map(async (photo) => {
			const storagePath = `${quoteId}/${photo.id}.webp`;

			const { error } = await supabase.storage.from(QUOTE_PHOTOS_BUCKET).upload(storagePath, photo.file, {
				contentType: 'image/webp',
			});

			if (error) throw error;

			return { quote_id: quoteId, storage_path: storagePath, file_name: photo.fileName };
		}),
	);

	const { data, error } = await supabase.from('quote_photos').insert(rows).select();

	if (error) throw error;
	return data;
}

export async function getQuotePhotos(quoteId: string): Promise<QuotePhotoWithUrl[]> {
	const { data, error } = await supabase
		.from('quote_photos')
		.select('*')
		.eq('quote_id', quoteId)
		.order('uploaded_at', { ascending: true });

	if (error) throw error;
	if (!data.length) return [];

	const { data: signed, error: signedError } = await supabase.storage.from(QUOTE_PHOTOS_BUCKET).createSignedUrls(
		data.map((photo) => photo.storage_path),
		SIGNED_URL_TTL_SECONDS,
	);

	if (signedError) throw signedError;

	const urlByPath = new Map(signed.map((entry) => [entry.path, entry.signedUrl]));

	return data.map((photo) => ({ ...photo, url: urlByPath.get(photo.storage_path) ?? null }));
}
