import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import App from './App';
import PushRouteBridge from './features/push/PushRouteBridge';
import { getClientPass } from './store/api/clientPass';
import './index.css';

// Warm up the client pass so the first sign-in does not wait on reCAPTCHA loading.
void getClientPass();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <PushRouteBridge />
                <App />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
);
