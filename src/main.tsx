import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toasts } from './components/Toasts.tsx'
import { ToastProvider } from './lib/toast.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
      <Toasts />
    </ToastProvider>
  </StrictMode>,
)
