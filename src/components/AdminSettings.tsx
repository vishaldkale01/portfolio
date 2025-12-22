import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Button } from './Button';
import { api } from '../utils/api';

interface AdminSettingsData {
  email: string;
  username: string;
  loginType: 'password' | 'otp';
}

export function AdminSettings() {
  const { theme } = useTheme();
  const [adminData, setAdminData] = useState<AdminSettingsData>({
    email: '',
    username: '',
    loginType: 'password'
  });
  const [emailData, setEmailData] = useState({ email: '', password: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [selectedLoginType, setSelectedLoginType] = useState<'password' | 'otp'>('password');
  
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [loginTypeLoading, setLoginTypeLoading] = useState(false);
  
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loginTypeError, setLoginTypeError] = useState<string | null>(null);
  
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [loginTypeSuccess, setLoginTypeSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminSettings();
  }, []);

  const fetchAdminSettings = async () => {
    try {
      const response = await api.get<{ email: string; username: string; loginType: 'password' | 'otp' }>('/admin/settings');
      if (!response.error && response.data) {
        setAdminData(response.data);
        setSelectedLoginType(response.data.loginType);
        setEmailData({ ...emailData, email: response.data.email });
      }
    } catch (error) {
      console.error('Failed to fetch admin settings:', error);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailError(null);
    setEmailSuccess(null);

    try {
      const response = await api.put<{ message: string }>('/admin/update-email', emailData);
      if (response.error) {
        setEmailError(response.error);
      } else {
        setEmailSuccess('Email updated successfully!');
        setEmailData({ email: emailData.email, password: '' });
        fetchAdminSettings();
      }
    } catch (error) {
      setEmailError('Failed to update email');
    } finally {
      setEmailLoading(false);
      setTimeout(() => {
        setEmailError(null);
        setEmailSuccess(null);
      }, 3000);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      setPasswordLoading(false);
      setTimeout(() => setPasswordError(null), 3000);
      return;
    }

    try {
      const response = await api.put<{ message: string }>('/admin/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.error) {
        setPasswordError(response.error);
      } else {
        setPasswordSuccess('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      setPasswordError('Failed to update password');
    } finally {
      setPasswordLoading(false);
      setTimeout(() => {
        setPasswordError(null);
        setPasswordSuccess(null);
      }, 3000);
    }
  };

  const handleUpdateLoginType = async () => {
    setLoginTypeLoading(true);
    setLoginTypeError(null);
    setLoginTypeSuccess(null);

    try {
      const response = await api.put<{ message: string; loginType: 'password' | 'otp' }>('/admin/update-login-type', {
        loginType: selectedLoginType
      });
      
      if (response.error) {
        setLoginTypeError(response.error);
      } else {
        setLoginTypeSuccess('Login type updated successfully!');
        fetchAdminSettings();
      }
    } catch (error) {
      setLoginTypeError('Failed to update login type');
    } finally {
      setLoginTypeLoading(false);
      setTimeout(() => {
        setLoginTypeError(null);
        setLoginTypeSuccess(null);
      }, 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Update Email */}
      <div>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
          Update Email
        </h3>
        {emailError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-3 text-sm">
            {emailError}
          </motion.div>
        )}
        {emailSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg mb-3 text-sm">
            {emailSuccess}
          </motion.div>
        )}
        <form onSubmit={handleUpdateEmail} className="space-y-3">
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              New Email
            </label>
            <input
              type="email"
              value={emailData.email}
              onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
              className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Current Password (for verification)
            </label>
            <input
              type="password"
              value={emailData.password}
              onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
              className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
              required
            />
          </div>
          <Button type="submit" isLoading={emailLoading} loadingText="Updating...">
            Update Email
          </Button>
        </form>
      </div>

      {/* Update Password */}
      <div>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
          Update Password
        </h3>
        {passwordError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-3 text-sm">
            {passwordError}
          </motion.div>
        )}
        {passwordSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg mb-3 text-sm">
            {passwordSuccess}
          </motion.div>
        )}
        <form onSubmit={handleUpdatePassword} className="space-y-3">
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" isLoading={passwordLoading} loadingText="Updating...">
            Update Password
          </Button>
        </form>
      </div>

      {/* Login Type Selection */}
      <div>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
          Login Preference
        </h3>
        {loginTypeError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-3 text-sm">
            {loginTypeError}
          </motion.div>
        )}
        {loginTypeSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg mb-3 text-sm">
            {loginTypeSuccess}
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Password Option */}
          <div 
            onClick={() => setSelectedLoginType('password')}
            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              selectedLoginType === 'password' 
                ? 'border-blue-500 bg-blue-500/10' 
                : `${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} hover:border-blue-500/50`
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${selectedLoginType === 'password' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h4 className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>Password Login</h4>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Traditional authentication using your email and a secure password.
                </p>
              </div>
            </div>
            {selectedLoginType === 'password' && (
              <div className="absolute top-4 right-4 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* OTP Option */}
          <div 
            onClick={() => setSelectedLoginType('otp')}
            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              selectedLoginType === 'otp' 
                ? 'border-blue-500 bg-blue-500/10' 
                : `${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} hover:border-blue-500/50`
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${selectedLoginType === 'otp' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>OTP Verification</h4>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Enhanced security using a one-time code sent to your email address.
                </p>
              </div>
            </div>
            {selectedLoginType === 'otp' && (
              <div className="absolute top-4 right-4 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {selectedLoginType !== adminData.loginType && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button onClick={handleUpdateLoginType} isLoading={loginTypeLoading} loadingText="Updating..." className="w-full md:w-auto">
              Save Preference
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
