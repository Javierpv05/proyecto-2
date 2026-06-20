import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App'
import { ToastProvider } from './context/ToastContext'
import { PedidosProvider } from './context/PedidosContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <PedidosProvider>
          <App />
        </PedidosProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
)
