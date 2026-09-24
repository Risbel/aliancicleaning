import type { ChangeEvent } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, ImageAdd01Icon } from '@hugeicons/core-free-icons';
import { Skeleton } from '@/components/ui/skeleton';
import { MAX_PHOTOS, type PendingQuotePhoto } from '@/lib/booking/photo-compression';

interface PhotoAttachmentsFieldProps {
	photos: PendingQuotePhoto[];
	isCompressing: boolean;
	onAddFiles: (files: File[]) => void;
	onRemovePhoto: (id: string) => void;
}

export function PhotoAttachmentsField({
	photos,
	isCompressing,
	onAddFiles,
	onRemovePhoto,
}: PhotoAttachmentsFieldProps) {
	const canAddMore = photos.length < MAX_PHOTOS;

	function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
		const files = Array.from(event.target.files ?? []);
		event.target.value = '';
		if (files.length) onAddFiles(files);
	}

	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm font-medium text-foreground">
				Photos <span className="font-normal text-muted-foreground">(optional)</span>
			</p>

			<div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
				{photos.map((photo) => (
					<div key={photo.id} className="relative aspect-square overflow-hidden rounded-xl border border-input">
						<img src={photo.previewUrl} alt={photo.fileName} className="h-full w-full object-cover" />
						<button
							type="button"
							onClick={() => onRemovePhoto(photo.id)}
							aria-label={`Remove ${photo.fileName}`}
							className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/80"
						>
							<HugeiconsIcon icon={Cancel01Icon} strokeWidth={2.5} className="size-3.5" />
						</button>
					</div>
				))}

				{isCompressing && <Skeleton className="aspect-square rounded-xl" />}

				{canAddMore && (
					<label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-input text-muted-foreground transition-colors hover:border-primary hover:text-primary">
						<HugeiconsIcon icon={ImageAdd01Icon} strokeWidth={1.8} className="size-6" />
						<span className="text-[11px] font-medium">Add</span>
						<input
							type="file"
							accept="image/*"
							multiple
							className="sr-only"
							disabled={isCompressing}
							onChange={handleFilesSelected}
						/>
					</label>
				)}
			</div>

			<p className="text-xs text-muted-foreground">
				Up to {MAX_PHOTOS} photos. They are resized on your device before being sent.
			</p>
		</div>
	);
}
