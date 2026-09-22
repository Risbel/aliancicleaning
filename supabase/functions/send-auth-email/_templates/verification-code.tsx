import { Section, Text } from 'react-email';
import { DEFAULT_SITE_URL, Disclaimer, EmailShell } from '../brand.tsx';

interface VerificationCodeEmailProps {
	code?: string;
	siteUrl?: string;
}

const VerificationCodeEmail = ({ code = '123456', siteUrl = DEFAULT_SITE_URL }: VerificationCodeEmailProps) => (
	<EmailShell preview="Your Alianci Cleaning verification code" siteUrl={siteUrl}>
		<Text className="m-0 mb-4 text-[20px] font-bold tracking-tight text-foreground">Confirm it is you</Text>
		<Text className="m-0 mb-7 text-[15px] leading-relaxed text-foreground">
			Enter this verification code to continue. It expires in one hour.
		</Text>
		<Section className="mb-7 rounded-lg bg-white-smoke py-5 text-center">
			<Text className="m-0 text-[32px] font-bold tracking-[0.35em] text-baltic-blue">{code}</Text>
		</Section>
		<Disclaimer>
			If you did not request this code, you can safely ignore this email and no changes will be made to your account.
		</Disclaimer>
	</EmailShell>
);

export default VerificationCodeEmail;
