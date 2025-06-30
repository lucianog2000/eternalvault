import React, { useState } from 'react';
import { Star, Mail, Lock, User, Eye, EyeOff, X, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterFormProps {
  onToggleMode: () => void;
  onClose?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const { signUp, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const result = await signUp(email, password, name);
    if (!result.success) {
      setError(result.error || 'Error creating account');
    } else {
      setSuccess('Account created successfully!');
      setRegistrationComplete(true);
    }
  };

  const handleGoToLogin = () => {
    setRegistrationComplete(false);
    setSuccess('');
    setError('');
    onToggleMode();
  };

  const isModal = !!onClose;

  // Show success screen after registration
  if (registrationComplete) {
    const successContent = (
      <div className={`${isModal ? 'max-w-md w-full' : 'max-w-md w-full'}`}>
        <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Check Your Email!</h1>
              <p className="text-white/80">Account created successfully</p>
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

          {/* Email Confirmation Notice */}
          <div className="space-y-6">
            <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-blue-200 font-bold text-lg mb-2">📧 Verification Email Sent</h3>
                  <p className="text-blue-200/90 text-sm mb-3">
                    We've sent a verification email to:
                  </p>
                  <div className="bg-blue-600/30 rounded-lg p-3 mb-3">
                    <p className="text-blue-100 font-mono text-sm break-all">{email}</p>
                  </div>
                  <p className="text-blue-200/90 text-sm">
                    Please check your inbox and click the verification link to confirm your account before signing in.
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-200 font-medium text-sm mb-2">Important Steps:</p>
                  <ol className="text-yellow-200/90 text-xs space-y-1 list-decimal list-inside">
                    <li>Check your email inbox (and spam folder)</li>
                    <li>Click the verification link in the email</li>
                    <li>Return here and sign in with your credentials</li>
                    <li>Start protecting your digital legacy!</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Email Provider Quick Links */}
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-white/80 text-sm mb-3">Quick access to popular email providers:</p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white/80 hover:text-white text-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>Gmail</span>
                </a>
                <a
                  href="https://outlook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white/80 hover:text-white text-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>Outlook</span>
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoToLogin}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all"
              >
                Go to Sign In
              </button>
              
              <button
                onClick={() => {
                  setRegistrationComplete(false);
                  setSuccess('');
                  setError('');
                  setName('');
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="w-full text-white/70 hover:text-white hover:bg-white/10 py-2 rounded-lg transition-all text-sm"
              >
                Register Different Email
              </button>
            </div>

            {/* Support Notice */}
            <div className="text-center">
              <p className="text-white/60 text-xs">
                Didn't receive the email? Check your spam folder or contact{' '}
                <a href="mailto:support@eternalvault.com" className="text-purple-300 hover:text-purple-200">
                  support@eternalvault.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );

    if (isModal) {
      return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          {successContent}
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        {successContent}
      </div>
    );
  }

  // Regular registration form
  const content = (
    <div className={`${isModal ? 'max-w-md w-full' : 'max-w-md w-full'}`}>
      <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-white/80">Start protecting your digital legacy</p>
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
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-300" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Your full name"
                disabled={loading}
              />
            </div>
          </div>

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

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={loading}
              />
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
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Toggle to Login */}
        <div className="mt-6 text-center">
          <p className="text-white/80">
            Already have an account?{' '}
            <button
              onClick={onToggleMode}
              className="text-purple-300 hover:text-purple-200 font-medium"
              disabled={loading}
            >
              Sign in here
            </button>
          </p>
        </div>

        {/* Demo Notice */}
        <div className="mt-6 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
          <p className="text-blue-200 text-xs text-center">
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

export default RegisterForm;