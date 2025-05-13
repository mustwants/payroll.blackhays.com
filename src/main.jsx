import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { GoogleScriptProvider } from './contexts/GoogleScriptContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <GoogleScriptProvider>
          <App />
          <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </GoogleScriptProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)