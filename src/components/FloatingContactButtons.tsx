import { HugeiconsIcon } from '@hugeicons/react';
import { Call02Icon, Message01Icon } from '@hugeicons/core-free-icons';

const smsBody = encodeURIComponent("Hi, I'd like to request a cleaning quote.");

export default function FloatingContactButtons() {
	return (
		<div className="fixed right-2 top-16 flex flex-col gap-3 z-50">
			<a
				href="tel:+15129028518"
				aria-label="Call us"
				className="flex items-center justify-center h-12 w-12 rounded-full bg-linear-to-br from-teal-500 to-teal-600 backdrop-blur-sm text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
			>
				<HugeiconsIcon icon={Call02Icon} size={22} strokeWidth={1.5} />
			</a>
			<a
				href={`sms:+15129028518?body=${smsBody}`}
				aria-label="Send us a text message"
				className="flex items-center justify-center h-12 w-12 rounded-full bg-linear-to-br from-blue-500/80 to-blue-600/80 backdrop-blur-sm text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
			>
				<HugeiconsIcon icon={Message01Icon} size={22} strokeWidth={1.5} />
			</a>
		</div>
	);
}
