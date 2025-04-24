import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { api } from '../utils/api';
import { LoadingSpinner } from './LoadingSpinner';
import { ApiResponse } from '../types';

interface PageSettings {
  _id?: string;
  homePage: {
    title: string;
    subtitle: string;
    description: string;
    showChatBot: boolean;
  };
  contactPage: {
    title: string;
    subtitle: string;
    description: string;
  };
  visibility: {
    showSkills: boolean;
    showProjects: boolean;
    showExperiences: boolean;
  };
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
  };
}

export function Settings() {
  const [settings, setSettings] = useState<PageSettings>({
    homePage: {
      title: 'Welcome to My Portfolio',
      subtitle: 'Full Stack Developer',
      description: 'I build modern web applications with cutting-edge technologies',
      showChatBot: true,
    },
    contactPage: {
      title: "Let's Connect",
      subtitle: 'Get in Touch',
      description: 'I am open to discussing new projects and opportunities',
    },
    visibility: {
      showSkills: true,
      showProjects: true,
      showExperiences: true,
    },
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: '',
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get<ApiResponse<PageSettings>>('/settings');
      if ('data' in response && response.data) {
        const settingsData = response.data as unknown as PageSettings;
        if ('homePage' in settingsData) {
          setSettings(settingsData);
        }
      }
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await api.put<ApiResponse<PageSettings>>('/settings', settings);
      if ('data' in response && response.data) {
        const settingsData = response.data as unknown as PageSettings;
        if ('homePage' in settingsData) {
          setSettings(settingsData);
        }
      }
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 p-6 rounded-lg border border-blue-500/30"
      >
        <h2 className="text-xl font-bold text-blue-400 mb-4">Home Page Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={settings.homePage.title}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  homePage: { ...settings.homePage, title: e.target.value },
                })
              }
              className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={settings.homePage.subtitle}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  homePage: { ...settings.homePage, subtitle: e.target.value },
                })
              }
              className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={settings.homePage.description}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  homePage: { ...settings.homePage, description: e.target.value },
                })
              }
              rows={3}
              className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.homePage.showChatBot}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  homePage: { ...settings.homePage, showChatBot: e.target.checked },
                })
              }
              className="h-4 w-4 text-blue-500 border-blue-500/30 rounded"
            />
            <label className="text-sm font-medium text-gray-300">
              Show Chat Bot
            </label>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 p-6 rounded-lg border border-blue-500/30"
      >
        <h2 className="text-xl font-bold text-blue-400 mb-4">Contact Page Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={settings.contactPage.title}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contactPage: { ...settings.contactPage, title: e.target.value },
                })
              }
              className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={settings.contactPage.subtitle}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contactPage: { ...settings.contactPage, subtitle: e.target.value },
                })
              }
              className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={settings.contactPage.description}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contactPage: { ...settings.contactPage, description: e.target.value },
                })
              }
              rows={3}
              className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 p-6 rounded-lg border border-blue-500/30"
      >
        <h2 className="text-xl font-bold text-blue-400 mb-4">Section Visibility</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.visibility.showSkills}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  visibility: { ...settings.visibility, showSkills: e.target.checked },
                })
              }
              className="h-4 w-4 text-blue-500 border-blue-500/30 rounded"
            />
            <label className="text-sm font-medium text-gray-300">
              Show Skills Section
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.visibility.showProjects}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  visibility: { ...settings.visibility, showProjects: e.target.checked },
                })
              }
              className="h-4 w-4 text-blue-500 border-blue-500/30 rounded"
            />
            <label className="text-sm font-medium text-gray-300">
              Show Projects Section
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.visibility.showExperiences}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  visibility: { ...settings.visibility, showExperiences: e.target.checked },
                })
              }
              className="h-4 w-4 text-blue-500 border-blue-500/30 rounded"
            />
            <label className="text-sm font-medium text-gray-300">
              Show Experiences Section
            </label>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 p-6 rounded-lg border border-blue-500/30"
      >
        <h2 className="text-xl font-bold text-blue-400 mb-4">Social Links</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              GitHub Profile
            </label>
            <input
              type="url"
              value={settings.socialLinks.github}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, github: e.target.value },
                })
              }
              className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              LinkedIn Profile
            </label>
            <input
              type="url"
              value={settings.socialLinks.linkedin}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, linkedin: e.target.value },
                })
              }
              className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Twitter Profile
            </label>
            <input
              type="url"
              value={settings.socialLinks.twitter}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, twitter: e.target.value },
                })
              }
              className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300"
            />
          </div>
        </div>
      </motion.div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          isLoading={saving}
          loadingText="Saving..."
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}