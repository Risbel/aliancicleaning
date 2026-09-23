import imageCompression from 'browser-image-compression';

export const MAX_PHOTOS = 10;
export const MAX_PHOTO_BYTES = 10 * 1024;

const COMPRESSION_WIDTHS = [1280, 640];

export interface PendingQuotePhoto {
	id: string;
	file: File;
	fileName: string;
	previewUrl: string;
}

export class PhotoCompressionError extends Error {
	readonly fileName: string;

	constructor(fileName: string, message: string) {
		super(message);
		this.name = 'PhotoCompressionError';
		this.fileName = fileName;
	}
}

export async function compressQuotePhoto(file: File): Promise<File> {
	if (!file.type.startsWith('image/')) {
		throw new PhotoCompressionError(file.name, `${file.name} is not an image.`);
	}

	let smallest: File | null = null;

	for (const maxWidthOrHeight of COMPRESSION_WIDTHS) {
		const compressed = await imageCompression(file, {
			maxSizeMB: MAX_PHOTO_BYTES / (1024 * 1024),
			maxWidthOrHeight,
			fileType: 'image/webp',
			initialQuality: 0.7,
			useWebWorker: true,
		});

		if (compressed.size <= MAX_PHOTO_BYTES) return compressed;
		if (!smallest || compressed.size < smallest.size) smallest = compressed;
	}

	throw new PhotoCompressionError(
		file.name,
		`${file.name} could not be compressed under ${Math.round(MAX_PHOTO_BYTES / 1024)} KB.`,
	);
}

export async function createPendingPhoto(file: File): Promise<PendingQuotePhoto> {
	const compressed = await compressQuotePhoto(file);

	return {
		id: crypto.randomUUID(),
		file: compressed,
		fileName: file.name,
		previewUrl: URL.createObjectURL(compressed),
	};
}
