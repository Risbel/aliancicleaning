import type { ChangeEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, ImageAdd01Icon } from '@hugeicons/core-free-icons';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { MAX_PHOTOS, type PendingQuotePhoto } from '@/lib/booking/photo-compression';
import type { BookingValues } from '@/lib/validation/booking-schema';

interface CustomServiceStepProps {
	form: UseFormReturn<BookingValues>;
	photos: PendingQuotePhoto[];
	isCompressing: boolean;
	onAddFiles: (files: File[]) => void;
	onRemovePhoto: (id: string) => void;
}

export function CustomServiceStep({ form, photos, isCompressing, onAddFiles, onRemovePhoto }: CustomServiceStepProps) {
	const canAddMore = photos.length < MAX_PHOTOS;

	function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
		const files = Array.from(event.target.files ?? []);
		event.target.value = '';
		if (files.length) onAddFiles(files);
	}

	return (
		<div className="flex flex-col gap-5">
			<FormField
				control={form.control}
				name="serviceDescription"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Describe the service you need</FormLabel>
						<FormControl>
							<Textarea
								rows={5}
								placeholder="For example: post-renovation cleanup of a two-car garage, including dust removal from shelves and pressure washing the floor."
								{...field}
								value={field.value ?? ''}
							/>
						</FormControl>
						<FormDescription>
							The more detail you give us, the more accurate the price we send back will be.
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

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
		</div>
	);
}
