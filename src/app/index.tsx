import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RusticGameEngine } from '@/core/engine'
import '@assets/styles/globals.css'
import App from '@main/App'

let engine = new RusticGameEngine
    engine.start() 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
