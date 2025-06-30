import React, { useState } from 'react';
import { Star, Mail, Lock, Eye, EyeOff, X, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onToggleMode: () => void;
  onClose?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { signIn, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await signIn(email, password);
    if (!result.success) {
      // Handle specific error cases
      if (result.error?.includes('Email not confirmed')) {
        setError('Please verify your email address before signing in. Check your inbox for the verification link.');
      } else if (result.error?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else {
        setError(result.error || 'Invalid credentials');
      }
    }
  };

  const isModal = !!onClose;

  const content = (
    <div className={`${isModal ? 'max-w-md w-full' : 'max-w-md w-full'}`}>
      <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Sign In</h1>
            <p className="text-white/80">Access your secure digital legacy</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-200 text-sm">{error}</p>
                  {error.includes('Email not confirmed') && (
                    <div className="mt-2 text-red-200/80 text-xs">
                      <p>Need help? Check your spam folder or contact support.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Email Verification Notice */}
        <div className="mt-6 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-200 text-xs">
                <strong>First time signing in?</strong> Make sure you've verified your email address by clicking the link we sent you.
              </p>
            </div>
          </div>
        </div>

        {/* Toggle to Register */}
        <div className="mt-6 text-center">
          <p className="text-white/80">
            Don't have an account?{' '}
            <button
              onClick={onToggleMode}
              className="text-purple-300 hover:text-purple-200 font-medium"
              disabled={loading}
            >
              Register here
            </button>
          </p>
        </div>

        {/* Demo Notice */}
        <div className="mt-6 p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg">
          <p className="text-purple-200 text-xs text-center">
            🚀 <strong>Powered by Supabase:</strong> Secure authentication with email verification
          </p>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {content}
    </div>
  );
};

export default LoginForm;