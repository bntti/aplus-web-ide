import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './app/App.js';
import { GlobalStateProvider } from './app/StateProvider';
import './i18n';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <GlobalStateProvider>
            <App />
        </GlobalStateProvider>
    </StrictMode>,
);
