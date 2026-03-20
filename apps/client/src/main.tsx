import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './ui/app.tsx';
import { BrowserRouter } from 'react-router';
import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'antd-mobile';
import enUS from 'antd-mobile/es/locales/en-US';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StyleProvider layer>
      <ConfigProvider locale={enUS}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigProvider>
    </StyleProvider>
  </StrictMode>
);
