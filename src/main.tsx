import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './ui/app.tsx';
import { BrowserRouter } from 'react-router';
import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'antd-mobile';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StyleProvider layer>
      <ConfigProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigProvider>
    </StyleProvider>
  </StrictMode>
);
