import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './globals.css'
import Portfolio from './page'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Portfolio />
  </StrictMode>,
)