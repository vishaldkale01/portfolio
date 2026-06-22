import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { Settings } from '../components/Settings';
import LearningManagementPanel from '../components/learning/LearningManagementPanel';
import { api } from '../utils/api';
import { ApiResponse, Settings as AppSettings } from '../types';
import { SkillsTab } from '../components/admin/SkillsTab';
import { ProjectsTab } from '../components/admin/ProjectsTab';
import { ExperiencesTab } from '../components/admin/ExperiencesTab';
import { ContactsTab } from '../components/admin/ContactsTab';
import { ProjectTypesTab } from '../components/admin/ProjectTypesTab';

export function AdminDashboard() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('skills');
  const [showLearningTab, setShowLearningTab] = useState(true);
  const [showSettingsTab, setShowSettingsTab] = useState(true);
  const { isAuthenticated } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchVisibility = async () => {
      const response = await api.get<ApiResponse<AppSettings>>('/settings');
      if ('data' in response && response.data?.visibility) {
        setShowLearningTab(response.data.visibility.showLearning ?? true);
        setShowSettingsTab(response.data.visibility.showAdmin ?? true);
      }
    };
    fetchVisibility();

    const handleSettingsUpdate = (event: CustomEvent<AppSettings>) => {
      if (event.detail.visibility) {
        setShowLearningTab(event.detail.visibility.showLearning ?? true);
        setShowSettingsTab(event.detail.visibility.showAdmin ?? true);
      }
    };

    window.addEventListener('settings:updated', handleSettingsUpdate as EventListener);
    return () => window.removeEventListener('settings:updated', handleSettingsUpdate as EventListener);
  }, []);

  const availableTabs = useMemo(
    () => ['project-types', 'skills', 'projects', 'experiences', 'contacts', ...(showSettingsTab ? ['settings'] : []), ...(showLearningTab ? ['learning'] : [])],
    [showLearningTab, showSettingsTab],
  );

  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0] || 'skills');
    }
  }, [activeTab, availableTabs]);

  const isLearningTab = activeTab === 'learning';

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100'}`}>
      <div className={`${isLearningTab ? 'w-full py-0' : 'max-w-[1700px] mx-auto py-2'} px-0 sm:px-0 lg:px-0`}>
        <div className={`grid grid-cols-1 ${isLearningTab ? 'min-h-[calc(100vh-72px)]' : 'lg:grid-cols-[220px_1fr] min-h-[calc(100vh-90px)]'}`}>
          {!isLearningTab && (
            <aside className={`lg:sticky lg:top-16 h-[calc(100vh-64px)] border-r ${theme === 'dark' ? 'border-gray-800 bg-[#0d1324]' : 'border-gray-200 bg-white'}`}>
              <nav className="space-y-1.5 p-4">
                {availableTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : theme === 'dark'
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    {tab.replace('-', ' ')}
                  </button>
                ))}
              </nav>
            </aside>
          )}

          <main className={`min-w-0 ${isLearningTab ? 'px-0 py-0' : 'px-4 sm:px-6 lg:px-8 py-4'}`}>
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
          </main>
        </div>
      </div>
    </div>
  );
}
