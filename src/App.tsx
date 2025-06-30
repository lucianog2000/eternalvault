import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CapsuleProvider } from './contexts/CapsuleContext';
import { LegacyProvider } from './contexts/LegacyContext';
import Layout from './components/Layout';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Capsules from './pages/Capsules';
import AccessKeys from './pages/AccessKeys';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Terms from './pages/Terms';

const AuthWrapper: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  return isLogin ? (
    <LoginForm onToggleMode={() => setIsLogin(false)} />
  ) : (
    <RegisterForm onToggleMode={() => setIsLogin(true)} />
  );
};

const AppContent: React.FC = () => {
  const { user, loading, initialized } = useAuth();

  // Show loading spinner while initializing auth
  if (!initialized || loading) {
    const storageInfo = typeof window !== 'undefined' ? {
      hasLocalStorage: typeof localStorage !== 'undefined',
      authToken: localStorage.getItem('eternalvault-auth-token') ? 'Present' : 'Not found',
      userAgent: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other'
    } : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70 text-lg mb-2">Initializing EternalVault...</p>
          <p className="text-white/50 text-sm mb-4">Powered by Supabase</p>
          
          {/* Debug info in development */}
          {import.meta.env.DEV && storageInfo && (
            <div className="bg-black/30 backdrop-blur rounded-lg p-3 text-xs text-white/60 mt-4">
              <p>🔄 Auth Status: {initialized ? 'Initialized' : 'Initializing'}</p>
              <p>📱 Storage: {storageInfo.hasLocalStorage ? '✅' : '❌'}</p>
              <p>🔑 Token: {storageInfo.authToken}</p>
              <p>🌐 Browser: {storageInfo.userAgent}</p>
            </div>
          )}
          
          <div className="text-white/40 text-xs mt-4">
            If this takes more than 5 seconds, please check your network connection
          </div>
        </div>
      </div>
    );
  }

  return (
    <LegacyProvider>
      <Layout>
        <Routes>
          {/* Public routes - accessible to everyone */}
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* Protected routes - only for authenticated users */}
          {user ? (
            <Route path="/*" element={
              <CapsuleProvider>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/capsules" element={<Capsules />} />
                  <Route path="/access-keys" element={<AccessKeys />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </CapsuleProvider>
            } />
          ) : (
            <>
              {/* Redirect protected routes to home when not authenticated */}
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/capsules" element={<Navigate to="/" replace />} />
              <Route path="/access-keys" element={<Navigate to="/" replace />} />
              <Route path="/settings" element={<Navigate to="/" replace />} />
              <Route path="/login" element={<AuthWrapper />} />
            </>
          )}
        </Routes>
      </Layout>
    </LegacyProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;