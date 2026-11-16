import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource-variable/figtree/index.css';
import './index.css';
import App from './App.tsx';
import { AppProviders } from './AppProviders';

const container = document.getElementById('root')!;

const app = (
	<AppProviders>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</AppProviders>
);

if (container.firstElementChild && window.location.pathname === '/') {
	hydrateRoot(container, app);
} else {
	createRoot(container).render(app);
}
