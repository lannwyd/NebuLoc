import './assets/main.css'
import { createRoot } from 'react-dom/client'
import App from './App'
import { LanguageProvider } from './context/LanguageContext'

createRoot(document.getElementById('root')).render(
    <LanguageProvider>
        <App />
    </LanguageProvider>
)