import { useQuotePhotos } from '@/hooks/queries/use-quote-photos';

export function QuotePhotoGallery({ quoteId }: { quoteId: string }) {
	const { data: photos } = useQuotePhotos(quoteId);

	if (!photos?.length) return null;

	return (
		<div className="mt-3 flex flex-col gap-2 border-t border-input pt-3">
			<span className="text-xs font-medium uppercase text-muted-foreground">Photos ({photos.length})</span>
			<div className="grid grid-cols-4 gap-2">
				{photos.map((photo) =>
					photo.url ? (
						<a
							key={photo.id}
							href={photo.url}
							target="_blank"
							rel="noopener noreferrer"
							className="overflow-hidden rounded-lg border border-input transition-opacity hover:opacity-75"
						>
							<img
								src={photo.url}
								alt={photo.file_name ?? 'Quote photo'}
								className="aspect-square w-full object-cover"
							/>
						</a>
					) : null,
				)}
			</div>
		</div>
	);
}
