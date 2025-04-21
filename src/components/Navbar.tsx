import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAdmin } from '../context/AdminContext';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAdmin();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg w-full">
      <div className="px-6 mx-auto">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
            Vishal Kale
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
              Home
            </Link>
            <Link to="/experience" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
              Experience
            </Link>
            <Link to="/projects" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
              Projects
            </Link>
            <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
              Contact
            </Link>
            {isAuthenticated && (
              <Link 
                to="/admin/dashboard" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500"
              >
                Admin
              </Link>
            )}
            <a 
              href="https://github.com/vishaldkale01" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              GitHub
            </a>
            <a 
              href="https://www.linkedin.com/in/vishal-kale-72b261218" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              LinkedIn
            </a>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}