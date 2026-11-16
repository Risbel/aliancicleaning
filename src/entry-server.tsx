import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App.tsx';
import { AppProviders } from './AppProviders';

export function render(url: string) {
	return renderToString(
		<AppProviders>
			<StaticRouter location={url}>
				<App />
			</StaticRouter>
		</AppProviders>,
	);
}
