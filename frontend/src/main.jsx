
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { CarritoProvider } from './context/CarritoContext'
import { ProductosProvider } from './context/ProductosContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProductosProvider>
          <CarritoProvider>
            <App />
          </CarritoProvider>
        </ProductosProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
