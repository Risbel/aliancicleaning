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
import type { ReactNode } from 'react';

export const DEFAULT_SITE_URL = 'https://www.aliancicleaning.com';

const tailwindConfig = {
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
};

interface EmailShellProps {
	preview: string;
	siteUrl: string;
	children: ReactNode;
}

export const EmailShell = ({ preview, siteUrl, children }: EmailShellProps) => (
	<Html>
		<Head />
		<Preview>{preview}</Preview>
		<Tailwind config={tailwindConfig}>
			<Body className="bg-white-smoke m-auto px-4 py-8 font-sans">
				<Container className="mx-auto max-w-[560px] overflow-hidden rounded-xl bg-white">
					<Section className="px-8 py-7" style={{ background: 'linear-gradient(135deg, #156390 0%, #54a8d0 100%)' }}>
						<Row>
							<Column className="w-12">
								<Img
									src={`${siteUrl}/favicon/web-app-manifest-192x192.png`}
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
					<Section className="px-8 py-8">{children}</Section>
				</Container>
			</Body>
		</Tailwind>
	</Html>
);

export const ActionButton = ({ href, label }: { href: string; label: string }) => (
	<Section className="mb-7 text-center">
		<Button
			href={href}
			className="rounded-full px-8 py-3 text-center text-[15px] font-semibold text-white no-underline"
			style={{
				backgroundColor: '#156390',
				backgroundImage: 'linear-gradient(to top right, #0d9488, #156390)',
			}}
		>
			{label}
		</Button>
	</Section>
);

export const FallbackLink = ({ href }: { href: string }) => (
	<Text className="m-0 text-[13px] leading-relaxed text-muted-foreground">
		If the button does not work, copy and paste this link into your browser:
		<br />
		<Link href={href} className="text-baltic-blue break-all">
			{href}
		</Link>
	</Text>
);

export const Disclaimer = ({ children }: { children: ReactNode }) => (
	<Text className="m-0 mt-6 border-t border-solid border-pale-sky pt-5 text-[13px] leading-relaxed text-muted-foreground">
		{children}
	</Text>
);
