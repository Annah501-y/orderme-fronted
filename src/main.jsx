import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './platform-theme.css';
import './theme-modes.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { applyTheme, getStoredTheme } from './theme.js';

applyTheme(getStoredTheme());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
