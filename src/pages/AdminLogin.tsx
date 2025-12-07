import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/Button';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [activeTab, setActiveTab] = useState<'password' | 'otp'>('password');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const { theme } = useTheme();
  const { login, sendOTP, verifyOTP, isAuthenticated } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Reset error when switching tabs
  useEffect(() => {
    setError(null);
  }, [activeTab]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await sendOTP(email);
      setOtpSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await verifyOTP(email, otp);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100'} flex items-center justify-center p-4`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className={`${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white/50'} p-8 rounded-lg border border-blue-500/30 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10`}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">
            Admin Login
          </h2>

          {/* Tabs */}
          <div className="flex mb-6 bg-gray-200/50 dark:bg-gray-800/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'password'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Password Login
            </button>
            <button
              onClick={() => setActiveTab('otp')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'otp'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              OTP Login
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {activeTab === 'password' ? (
              <motion.form
                key="password-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handlePasswordLogin}
                className="space-y-6"
              >
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  loadingText="Logging in..."
                  className="w-full"
                >
                  Log In
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOTP}
                className="space-y-6"
              >
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                    required
                    disabled={otpSent}
                  />
                </div>

                {otpSent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Enter OTP
                    </label>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                      We've sent a 6-digit code to {email}
                    </p>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400 tracking-[0.5em] text-center font-mono text-lg`}
                      required
                      placeholder="000000"
                      autoFocus
                    />
                  </motion.div>
                )}

                {!otpSent ? (
                  <Button
                    type="button"
                    onClick={handleSendOTP}
                    isLoading={isLoading}
                    loadingText="Sending OTP..."
                    className="w-full"
                  >
                    Send OTP
                  </Button>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Button
                      type="submit"
                      isLoading={isLoading}
                      loadingText="Verifying..."
                      className="w-full"
                    >
                      Verify & Login
                    </Button>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Change Email / Resend
                    </button>
                  </div>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}