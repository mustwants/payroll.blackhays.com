import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { GoogleScriptProvider } from './contexts/GoogleScriptContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

if (!googleClientId) {
  console.warn('Google Client ID not configured - Google login functionality will not work properly');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <GoogleScriptProvider>
            <App />
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
          </GoogleScriptProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)