import { Text } from 'react-email';
import { ActionButton, DEFAULT_SITE_URL, Disclaimer, EmailShell, FallbackLink } from '../brand.tsx';

interface ResetPasswordEmailProps {
	resetUrl?: string;
	siteUrl?: string;
}

const ResetPasswordEmail = ({
	resetUrl = 'https://www.aliancicleaning.com/auth/confirm?token=sample-token',
	siteUrl = DEFAULT_SITE_URL,
}: ResetPasswordEmailProps) => (
	<EmailShell preview="Reset your Alianci Cleaning password" siteUrl={siteUrl}>
		<Text className="m-0 mb-4 text-[20px] font-bold tracking-tight text-foreground">Reset your password</Text>
		<Text className="m-0 mb-7 text-[15px] leading-relaxed text-foreground">
			We received a request to reset the password for your Alianci Cleaning account. Choose a new password using the
			link below. This link expires in one hour.
		</Text>
		<ActionButton href={resetUrl} label="Reset my password" />
		<FallbackLink href={resetUrl} />
		<Disclaimer>
			If you did not request a password reset, you can safely ignore this email. Your password will not change until
			you open the link above.
		</Disclaimer>
	</EmailShell>
);

export default ResetPasswordEmail;
