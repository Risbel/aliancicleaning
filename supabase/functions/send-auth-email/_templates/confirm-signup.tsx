import { Text } from 'react-email';
import { ActionButton, DEFAULT_SITE_URL, Disclaimer, EmailShell, FallbackLink } from '../brand.tsx';

interface ConfirmSignupEmailProps {
	confirmUrl?: string;
	siteUrl?: string;
	preview?: string;
	heading?: string;
	intro?: string;
	buttonLabel?: string;
	disclaimer?: string;
}

const ConfirmSignupEmail = ({
	confirmUrl = 'https://www.aliancicleaning.com/auth/confirm?token=sample-token',
	siteUrl = DEFAULT_SITE_URL,
	preview = 'Confirm your email to finish setting up your account',
	heading = 'Confirm your email',
	intro = 'Thanks for signing up with Alianci Cleaning. Confirm your email address to activate your account and book your first cleaning.',
	buttonLabel = 'Confirm my email',
	disclaimer = 'If you did not create an account with Alianci Cleaning, you can safely ignore this email.',
}: ConfirmSignupEmailProps) => (
	<EmailShell preview={preview} siteUrl={siteUrl}>
		<Text className="m-0 mb-4 text-[20px] font-bold tracking-tight text-foreground">{heading}</Text>
		<Text className="m-0 mb-7 text-[15px] leading-relaxed text-foreground">{intro}</Text>
		<ActionButton href={confirmUrl} label={buttonLabel} />
		<FallbackLink href={confirmUrl} />
		<Disclaimer>{disclaimer}</Disclaimer>
	</EmailShell>
);

export default ConfirmSignupEmail;
