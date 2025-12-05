import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { Settings } from '../components/Settings';
import LearningManagementPanel from '../components/learning/LearningManagementPanel';
import { SkillsTab } from '../components/admin/SkillsTab';
import { ProjectsTab } from '../components/admin/ProjectsTab';
import { ExperiencesTab } from '../components/admin/ExperiencesTab';
import { ContactsTab } from '../components/admin/ContactsTab';
import { ProjectTypesTab } from '../components/admin/ProjectTypesTab';

export function AdminDashboard() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('skills');
  const { isAuthenticated } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100'}`}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <nav className="flex flex-wrap gap-2 mb-8 p-2 bg-gray-800/30 backdrop-blur-sm rounded-lg">
          {['project-types', 'skills', 'projects', 'experiences', 'contacts', 'settings' , 'learning'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {activeTab === 'skills' && <SkillsTab />}
            {activeTab === 'project-types' && <ProjectTypesTab />}
            {activeTab === 'projects' && <ProjectsTab />}
            {activeTab === 'experiences' && <ExperiencesTab />}
            {activeTab === 'contacts' && <ContactsTab />}
            {activeTab === 'learning' && <LearningManagementPanel />}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <Settings />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}