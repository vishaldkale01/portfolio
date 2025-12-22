import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import { useProjects } from '../../hooks/useProjects';
import { useProjectTypes } from '../../hooks/useProjectTypes';
import { Project } from '../../types';

export function ProjectsTab() {
  const { theme } = useTheme();
  const {
    projects,
    loading,
    submitLoading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  } = useProjects();
  const { projectTypes } = useProjectTypes();

  const formRef = useRef<HTMLDivElement>(null);

  const [newProject, setNewProject] = useState<Partial<Project> & { startDateStr?: string; endDateStr?: string }>({
    title: '',
    description: '',
    techStack: [],
    projectTypes: [],
    isCurrentProject: false,
    startDate: new Date(),
    startDateStr: new Date().toISOString().split('T')[0],
    endDateStr: ''
  });
  const [editingProject, setEditingProject] = useState<(Partial<Project> & { startDateStr?: string; endDateStr?: string }) | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createProject(newProject);
    if (success) {
      setNewProject({
        title: '',
        description: '',
        techStack: [],
        projectTypes: [],
        isCurrentProject: false,
        startDate: new Date(),
        startDateStr: new Date().toISOString().split('T')[0],
        endDateStr: ''
      });
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?._id) return;
    const success = await updateProject(editingProject._id, editingProject);
    if (success) {
      setEditingProject(null);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    await deleteProject(id);
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-blue-400">Loading projects...</p>
          </div>
        </div>
      ) : (
        <>
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white/50'} p-6 rounded-lg border border-blue-500/30`}
          >
            <h2 className="text-xl font-bold text-blue-400 mb-6">
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </h2>
            
            <form onSubmit={editingProject ? handleEditProject : handleCreateProject} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingProject?.title || newProject.title}
                    onChange={e => editingProject
                      ? setEditingProject({...editingProject, title: e.target.value})
                      : setNewProject({...newProject, title: e.target.value})}
                    className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Description
                  </label>
                  <textarea
                    value={editingProject?.description || newProject.description}
                    onChange={e => editingProject
                      ? setEditingProject({...editingProject, description: e.target.value})
                      : setNewProject({...newProject, description: e.target.value})}
                    className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                    rows={3}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Project Types
                </label>
                <div className="flex flex-wrap gap-3">
                  {projectTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        const currentTypes = editingProject?.projectTypes || newProject.projectTypes || [];
                        const updatedTypes = currentTypes.includes(type)
                          ? currentTypes.filter(t => t !== type)
                          : [...currentTypes, type];
                        
                        editingProject
                          ? setEditingProject({...editingProject, projectTypes: updatedTypes})
                          : setNewProject({...newProject, projectTypes: updatedTypes});
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        (editingProject?.projectTypes || newProject.projectTypes || []).includes(type)
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : `${theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Tech Stack
                </label>
                <input
                  type="text"
                  value={(editingProject?.techStack || newProject.techStack || []).join(', ')}
                  onChange={e => {
                    const techStack = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                    editingProject
                      ? setEditingProject({...editingProject, techStack})
                      : setNewProject({...newProject, techStack});
                  }}
                  placeholder="Enter technologies separated by commas"
                  className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editingProject?.startDateStr || newProject.startDateStr || ''}
                    onInput={e => {
                      const input = e.target as HTMLInputElement;
                      const value = input.value;
                      editingProject
                        ? setEditingProject({...editingProject, startDateStr: value})
                        : setNewProject({...newProject, startDateStr: value});
                    }}
                    onChange={e => {
                      const value = e.target.value;
                      editingProject
                        ? setEditingProject({...editingProject, startDate: value ? new Date(value) : undefined, startDateStr: value})
                        : setNewProject({...newProject, startDate: value ? new Date(value) : undefined, startDateStr: value});
                    }}
                    className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editingProject?.endDateStr || newProject.endDateStr || ''}
                    onInput={e => {
                      const input = e.target as HTMLInputElement;
                      const value = input.value;
                      editingProject
                        ? setEditingProject({...editingProject, endDateStr: value})
                        : setNewProject({...newProject, endDateStr: value});
                    }}
                    onChange={e => {
                      const value = e.target.value;
                      editingProject
                        ? setEditingProject({...editingProject, endDate: value ? new Date(value) : undefined, endDateStr: value})
                        : setNewProject({...newProject, endDate: value ? new Date(value) : undefined, endDateStr: value});
                    }}
                    className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                    disabled={editingProject?.isCurrentProject || newProject.isCurrentProject}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editingProject?.isCurrentProject || newProject.isCurrentProject}
                  onChange={e => {
                    const isCurrentProject = e.target.checked;
                    editingProject
                      ? setEditingProject({...editingProject, isCurrentProject})
                      : setNewProject({...newProject, isCurrentProject});
                  }}
                  className="h-4 w-4 text-blue-500 border-blue-500/30 rounded"
                />
                <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Current Project
                </label>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  isLoading={submitLoading}
                  loadingText={editingProject ? "Updating..." : "Adding..."}
                >
                  {editingProject ? 'Update Project' : 'Add Project'}
                </Button>
                {editingProject && (
                  <Button
                    variant="secondary"
                    onClick={() => setEditingProject(null)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </motion.div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <motion.div
                key={project._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`relative group ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white/50'} p-6 rounded-lg border border-blue-500/30 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-lg"></div>
                <div className="relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} text-lg`}>
                        {project.title}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        {project.description}
                      </p>
                    </div>
                    {project.isCurrentProject && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        Current Project
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Technologies:</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map((tech, index) => (
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
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Project Types:</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.projectTypes.map((type, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30"
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-400">
                    <p>Started: {project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Date not set'}</p>
                    {project.endDate && (
                      <p>Completed: {new Date(project.endDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                    )}
                  </div>

                  <div className="mt-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingProject(project);
                        setTimeout(() => {
                          formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteProject(project._id!)}
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
