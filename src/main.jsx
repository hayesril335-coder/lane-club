import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App'
import AppLayout from './layouts/AppLayout'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppLayout><App /></AppLayout>
  </React.StrictMode>,
)
