import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.js';
import { GlobalStateProvider } from './app/StateProvider';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <GlobalStateProvider>
            <App />
        </GlobalStateProvider>
    </React.StrictMode>,
);
