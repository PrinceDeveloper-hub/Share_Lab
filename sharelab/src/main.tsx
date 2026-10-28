import { createRoot } from 'react-dom'
import { Router } from '@tanstack/react-router'
import Routes from './routes'
import './styles/tokens.css'
import './styles.css'

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <Routes />
    </Router>
  </React.StrictMode>,
)