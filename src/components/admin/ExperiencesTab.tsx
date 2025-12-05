import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import { useExperiences } from '../../hooks/useExperiences';
import { Experience } from '../../types';

export function ExperiencesTab() {
  const { theme } = useTheme();
  const {
    experiences,
    loading,
    submitLoading,
    fetchExperiences,
    createExperience,
    updateExperience,
    deleteExperience
  } = useExperiences();

  const [newExperience, setNewExperience] = useState<Partial<Experience> & { startDateStr?: string; endDateStr?: string }>({
    company: '',
    role: '',
    description: '',
    startDate: new Date(),
    startDateStr: new Date().toISOString().split('T')[0],
    endDateStr: '',
    responsibilities: [],
    technologies: [],
    isCurrentRole: false
  });
  const [editingExperience, setEditingExperience] = useState<(Partial<Experience> & { startDateStr?: string; endDateStr?: string }) | null>(null);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const handleCreateExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createExperience(newExperience);
    if (success) {
      setNewExperience({
        company: '',
        role: '',
        description: '',
        startDate: new Date(),
        startDateStr: new Date().toISOString().split('T')[0],
        endDateStr: '',
        responsibilities: [],
        technologies: [],
        isCurrentRole: false
      });
    }
  };

  const handleEditExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExperience?._id) return;
    const success = await updateExperience(editingExperience._id, editingExperience);
    if (success) {
      setEditingExperience(null);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) return;
    await deleteExperience(id);
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-blue-400">Loading experiences...</p>
          </div>
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white/50'} p-6 rounded-lg border border-blue-500/30`}
          >
            <h2 className="text-xl font-bold text-blue-400 mb-6">
              {editingExperience ? 'Edit Experience' : 'Add New Experience'}
            </h2>
            
            <form onSubmit={editingExperience ? handleEditExperience : handleCreateExperience} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Company</label>
                  <input
                    type="text"
                    value={editingExperience?.company || newExperience.company}
                    onChange={e => editingExperience
                      ? setEditingExperience({...editingExperience, company: e.target.value})
                      : setNewExperience({...newExperience, company: e.target.value})}
                    className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Role</label>
                  <input
                    type="text"
                    value={editingExperience?.role || newExperience.role}
                    onChange={e => editingExperience
                      ? setEditingExperience({...editingExperience, role: e.target.value})
                      : setNewExperience({...newExperience, role: e.target.value})}
                    className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Description</label>
                <textarea
                  value={editingExperience?.description || newExperience.description}
                  onChange={e => editingExperience
                    ? setEditingExperience({...editingExperience, description: e.target.value})
                    : setNewExperience({...newExperience, description: e.target.value})}
                  className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Technologies</label>
                <input
                  type="text"
                  value={(editingExperience?.technologies || newExperience.technologies || []).join(', ')}
                  onChange={e => {
                    const technologies = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                    editingExperience
                      ? setEditingExperience({...editingExperience, technologies})
                      : setNewExperience({...newExperience, technologies});
                  }}
                  placeholder="Enter technologies separated by commas"
                  className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Responsibilities</label>
                <textarea
                  value={(editingExperience?.responsibilities || newExperience.responsibilities || []).join('\n')}
                  onChange={e => {
                    const responsibilities = e.target.value.split('\n').map(r => r.trim()).filter(Boolean);
                    editingExperience
                      ? setEditingExperience({...editingExperience, responsibilities})
                      : setNewExperience({...newExperience, responsibilities});
                  }}
                  placeholder="Enter responsibilities (one per line)"
                  className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Start Date</label>
                  <input
                    type="date"
                    value={editingExperience?.startDateStr || newExperience.startDateStr || ''}
                    onInput={e => {
                      const input = e.target as HTMLInputElement;
                      const value = input.value;
                      editingExperience
                        ? setEditingExperience({...editingExperience, startDateStr: value})
                        : setNewExperience({...newExperience, startDateStr: value});
                    }}
                    onChange={e => {
                      const value = e.target.value;
                      editingExperience
                        ? setEditingExperience({...editingExperience, startDate: value ? new Date(value) : undefined, startDateStr: value})
                        : setNewExperience({...newExperience, startDate: value ? new Date(value) : undefined, startDateStr: value});
                    }}
                    className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>End Date</label>
                  <input
                    type="date"
                    value={editingExperience?.endDateStr || newExperience.endDateStr || ''}
                    onInput={e => {
                      const input = e.target as HTMLInputElement;
                      const value = input.value;
                      editingExperience
                        ? setEditingExperience({...editingExperience, endDateStr: value})
                        : setNewExperience({...newExperience, endDateStr: value});
                    }}
                    onChange={e => {
                      const value = e.target.value;
                      editingExperience
                        ? setEditingExperience({...editingExperience, endDate: value ? new Date(value) : undefined, endDateStr: value})
                        : setNewExperience({...newExperience, endDate: value ? new Date(value) : undefined, endDateStr: value});
                    }}
                    className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                    disabled={editingExperience?.isCurrentRole || newExperience.isCurrentRole}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editingExperience?.isCurrentRole || newExperience.isCurrentRole}
                  onChange={e => {
                    const isCurrentRole = e.target.checked;
                    editingExperience
                      ? setEditingExperience({...editingExperience, isCurrentRole})
                      : setNewExperience({...newExperience, isCurrentRole});
                  }}
                  className="h-4 w-4 text-blue-500 border-blue-500/30 rounded"
                />
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Current Role</label>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  isLoading={submitLoading}
                  loadingText={editingExperience ? "Updating..." : "Adding..."}
                >
                  {editingExperience ? 'Update Experience' : 'Add Experience'}
                </Button>
                {editingExperience && (
                  <Button
                    variant="secondary"
                    onClick={() => setEditingExperience(null)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {experiences.map((experience) => (
              <motion.div
                key={experience._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`relative group ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white/50'} p-6 rounded-lg border border-blue-500/30 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} text-lg`}>
                        {experience.company}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        {experience.role}
                      </p>
                    </div>
                    <span className={`text-lg ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} font-semibold`}>
                      {experience.isCurrentRole ? 'Current' : 'Past'}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Technologies:</h4>
                    <div className="flex flex-wrap gap-2">
                      {experience.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Responsibilities:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {experience.responsibilities.map((responsibility, index) => (
                        <li key={index} className="text-sm text-gray-300">{responsibility}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 text-sm text-gray-400">
                    <p>Started: {experience.startDate ? new Date(experience.startDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Date not set'}</p>
                    {experience.endDate && (
                      <p>Ended: {new Date(experience.endDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                    )}
                  </div>

                  <div className="mt-4 flex space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      onClick={() => setEditingExperience(experience)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteExperience(experience._id!)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
