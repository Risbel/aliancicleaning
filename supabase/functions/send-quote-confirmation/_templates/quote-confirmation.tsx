import {
	Body,
	Button,
	Column,
	Container,
	Head,
	Heading,
	Html,
	Img,
	Link,
	Preview,
	Row,
	Section,
	Tailwind,
	Text,
} from 'react-email';

interface QuoteConfirmationEmailProps {
	customerName?: string;
	visitDate?: string;
	address?: string;
	price?: string | null;
	confirmationUrl?: string;
	siteUrl?: string;
}

const QuoteConfirmationEmail = ({
	customerName = 'Jane Doe',
	visitDate = 'Monday, July 13, 2026 at 10:00 AM',
	address = '123 Main St, Boston, MA',
	price = '$120.00',
	confirmationUrl = 'https://aliancicleaning.vercel.app/confirmation/sample-token',
	siteUrl = 'https://aliancicleaning.vercel.app',
}: QuoteConfirmationEmailProps) => {
	const rows = [['Visit date', visitDate], ['Address', address], ...(price ? [['Price', price]] : [])];

	return (
		<Html>
			<Head />
			<Preview>Your cleaning quote is ready — confirm your booking</Preview>
			<Tailwind
				config={{
					theme: {
						extend: {
							colors: {
								'baltic-blue': '#156390',
								'fresh-sky': '#54a8d0',
								'pale-sky': '#cbe0ea',
								'white-smoke': '#f2f2f2',
								'mint-leaf': '#5bb286',
								foreground: '#1a2e3f',
								'muted-foreground': '#6b7a86',
							},
						},
					},
				}}
			>
				<Body className="bg-white-smoke m-auto px-4 py-8 font-sans">
					<Container className="mx-auto max-w-[560px] overflow-hidden rounded-xl bg-white">
						<Section className="px-8 py-7" style={{ background: 'linear-gradient(135deg, #156390 0%, #54a8d0 100%)' }}>
							<Row>
								<Column className="w-12">
									<Img
										src={`${siteUrl}/favicon/favicon-96x96.png`}
										width="44"
										height="44"
										alt="Alianci Cleaning"
										className="rounded-full"
									/>
								</Column>
								<Column className="pl-3">
									<Heading className="m-0 text-[22px] font-bold tracking-tight text-white">Alianci Cleaning</Heading>
								</Column>
							</Row>
						</Section>
						<Section className="px-8 py-8">
							<Text className="m-0 mb-4 text-base text-foreground">Hi {customerName},</Text>
							<Text className="m-0 mb-6 text-[15px] leading-relaxed text-foreground">
								Your cleaning quote is ready. Review the details below and confirm your booking.
							</Text>
							<Section className="mb-7 border-y border-solid border-pale-sky">
								{rows.map(([label, value]) => (
									<Row key={label}>
										<Column className="py-2 text-sm text-muted-foreground">{label}</Column>
										<Column className="py-2 text-right text-sm font-semibold text-foreground">{value}</Column>
									</Row>
								))}
							</Section>
							<Section className="mb-7 text-center">
								<Button
									href={confirmationUrl}
									className="rounded-full px-8 py-3 text-center text-[15px] font-semibold text-white no-underline"
									style={{
										backgroundColor: '#156390',
										backgroundImage: 'linear-gradient(to top right, #0d9488, #156390)',
									}}
								>
									Confirm your booking
								</Button>
							</Section>
							<Text className="m-0 text-[13px] leading-relaxed text-muted-foreground">
								If the button does not work, copy and paste this link into your browser:
								<br />
								<Link href={confirmationUrl} className="text-baltic-blue break-all">
									{confirmationUrl}
								</Link>
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default QuoteConfirmationEmail;
