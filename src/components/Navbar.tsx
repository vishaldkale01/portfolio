import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAdmin } from '../context/AdminContext';
import { api } from '../utils/api';
import { Settings, ApiResponse, ApiErrorResponse } from '../types';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAdmin();
  const navigate = useNavigate();
  const [showLearning, setShowLearning] = useState(true); // Default to true

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get<ApiResponse<Settings>>('/settings');
        
        const isErrorResponse = (res: ApiResponse<any>): res is ApiErrorResponse => {
          return 'error' in res && 'status' in res;
        };

        if (!isErrorResponse(response) && 'data' in response) {
          const settingsData = response.data;
          if (settingsData.visibility) {
            setShowLearning(settingsData.visibility.showLearning ?? true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        // Default to showing learning link on error
        setShowLearning(true);
      }
    };

    fetchSettings();

    // Listen for settings updates
    const handleSettingsUpdate = (event: CustomEvent<Settings>) => {
      if (event.detail.visibility) {
        setShowLearning(event.detail.visibility.showLearning ?? true);
      }
    };

    window.addEventListener('settings:updated', handleSettingsUpdate as EventListener);
    return () => {
      window.removeEventListener('settings:updated', handleSettingsUpdate as EventListener);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/" 
            className="text-xl font-mono font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            Vishal Kale
          </Link>
          
          <div className="flex items-center space-x-8">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/experience" className="nav-link">
              Experience
            </Link>
            <Link to="/projects" className="nav-link">
              Projects
            </Link>
            <Link to="/contact" className="nav-link">
              Contact
            </Link>
            {showLearning && (
              <Link to="/learning" className="nav-link">
                Learning
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/admin/dashboard" className="nav-link flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Admin</span>
              </Link>
            )}
            
            <div className="flex items-center pl-8 border-l border-gray-200 dark:border-gray-700 space-x-4">
              <a 
                href="https://github.com/vishaldkale01" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.607 9.607 0 0112 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48C19.137 20.107 22 16.373 22 11.969 22 6.463 17.522 2 12 2z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/in/vishal-kale-72b261218" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => {
                  if (isAuthenticated) {
                    logout();
                    navigate('/');
                  } else {
                    navigate('/admin/login');
                  }
                }}
                className="button-primary"
              >
                <span>{isAuthenticated ? 'Logout' : 'Login'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}