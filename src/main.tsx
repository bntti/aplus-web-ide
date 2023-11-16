import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.js';
import { Provider } from 'react-redux';
import store from './app/store.js';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>,
);
