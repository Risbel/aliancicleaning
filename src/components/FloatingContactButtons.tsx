import { HugeiconsIcon } from '@hugeicons/react';
import { Call02Icon, WhatsappIcon } from '@hugeicons/core-free-icons';

export default function FloatingContactButtons() {
	return (
		<div className="fixed right-2 top-16 flex flex-col gap-3 z-50">
			<a
				href="tel:+15129028518"
				aria-label="Call us"
				className="flex items-center justify-center h-12 w-12 rounded-full bg-linear-to-br from-blue-500/50 to-blue-600/50 backdrop-blur-sm text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
			>
				<HugeiconsIcon icon={Call02Icon} size={22} strokeWidth={1.5} />
			</a>
			<a
				href="https://wa.me/15129028518"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Chat on WhatsApp"
				className="flex items-center justify-center h-12 w-12 rounded-full bg-linear-to-br from-green-500/80 to-green-600/80 backdrop-blur-sm text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
			>
				<HugeiconsIcon icon={WhatsappIcon} size={22} strokeWidth={1.5} />
			</a>
		</div>
	);
}
