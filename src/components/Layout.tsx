import React, { useState } from 'react';
import { Star, LogOut, User, Home, Package, MessageCircle, Settings, Key, LogIn, UserPlus, Menu, X, Scale, Globe } from 'lucide-react';
import { LocaleSwitcher } from "lingo.dev/react/client";
import { useAuth } from '../contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import LoginForm from './Auth/LoginForm';
import RegisterForm from './Auth/RegisterForm';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut, loading } = useAuth();
  const location = useLocation();
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation for logged in users
  const authenticatedNavigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: Package },
    { name: 'Capsules', href: '/capsules', icon: Package },
    { name: 'Access Keys', href: '/access-keys', icon: Key },
    { name: 'Guardian Angel', href: '/chat', icon: MessageCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Navigation for non-logged in users
  const publicNavigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Guardian Angel', href: '/chat', icon: MessageCircle },
    { name: 'Terms', href: '/terms', icon: Scale },
  ];

  const navigation = user ? authenticatedNavigation : publicNavigation;

  const handleShowLogin = () => {
    setIsLogin(true);
    setShowAuth(true);
    setIsMobileMenuOpen(false);
  };

  const handleShowRegister = () => {
    setIsLogin(false);
    setShowAuth(true);
    setIsMobileMenuOpen(false);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">EternalVault</span>
          </div>
          <div className="flex items-center space-x-2">
            <LocaleSwitcher locales={["en", "es", "fr", "de"]} />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">
          <div className="fixed top-16 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-white/10 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Navigation */}
            <nav className="p-4 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={handleNavClick}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile / Auth Buttons */}
            <div className="p-4 border-t border-white/10">
              {user ? (
                // Logged in user - show profile and logout
                <>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-white/60 text-sm">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    disabled={loading}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                // Non-logged in user - show auth buttons
                <div className="space-y-3">
                  <div className="text-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-white/60 text-sm">Guest</p>
                  </div>
                  
                  <button
                    onClick={handleShowLogin}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                  
                  <button
                    onClick={handleShowRegister}
                    className="flex items-center space-x-2 w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </button>
                  
                  <div className="mt-3 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-200 text-xs text-center">
                      🚀 <strong>Powered by Supabase:</strong> Secure authentication with real user management
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-50 w-64 bg-white/10 backdrop-blur-md border-r border-white/10">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">EternalVault</span>
            </div>
            <LocaleSwitcher locales={["en", "es", "fr", "de"]} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Auth Buttons */}
          <div className="p-4 border-t border-white/10">
            {user ? (
              // Logged in user - show profile and logout
              <>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-white/60 text-sm">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              // Non-logged in user - show auth buttons
              <div className="space-y-3">
                <div className="text-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-white/60 text-sm">Guest</p>
                </div>
                
                <button
                  onClick={handleShowLogin}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
                
                <button
                  onClick={handleShowRegister}
                  className="flex items-center space-x-2 w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </button>
                
                <div className="mt-3 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-200 text-xs text-center">
                    🚀 <strong>Powered by Supabase:</strong> Secure authentication with real user management
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <main className="min-h-screen p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Auth Modals */}
      {showAuth && (
        isLogin ? (
          <LoginForm onToggleMode={handleToggleMode} onClose={handleCloseAuth} />
        ) : (
          <RegisterForm onToggleMode={handleToggleMode} onClose={handleCloseAuth} />
        )
      )}
    </div>
  );
};

export default Layout;