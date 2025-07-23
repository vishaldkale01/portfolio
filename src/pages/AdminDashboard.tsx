import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Skill, Project, Experience, Contact, ApiErrorResponse } from '../types';
import { Settings } from '../components/Settings';

type ProjectType = 'backend' | 'frontend' | 'fullstack' | 'ai' | 'mobile';

const isErrorResponse = (res: any): res is ApiErrorResponse => {
  return 'error' in res && 'status' in res;
};

export function AdminDashboard() {
  const { theme } = useTheme();
  const [newProjectType, setNewProjectType] = useState('');
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>(['backend', 'frontend', 'fullstack', 'ai', 'mobile']);
  const [editingProjectType, setEditingProjectType] = useState<{ oldType: ProjectType; newType: string } | null>(null);

  const handleAddProjectType = () => {
    if (newProjectType.trim()) {
      setProjectTypes([...projectTypes, newProjectType.trim().toLowerCase() as ProjectType]);
      setNewProjectType('');
    }
  };

  const handleEditProjectType = () => {
    if (editingProjectType && editingProjectType.newType.trim()) {
      setProjectTypes(projectTypes.map(type => 
        type === editingProjectType.oldType ? editingProjectType.newType.toLowerCase() as ProjectType : type
      ));
      setEditingProjectType(null);
    }
  };

  const handleDeleteProjectType = (typeToDelete: ProjectType) => {
    if (window.confirm(`Are you sure you want to delete project type "${typeToDelete}"?`)) {
      setProjectTypes(projectTypes.filter(type => type !== typeToDelete));
    }
  };

  const [activeTab, setActiveTab] = useState('skills');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    name: '',
    category: '',
    proficiency: 0
  });

  const [editingSkill, setEditingSkill] = useState<Partial<Skill> | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [projects, setProjects] = useState<Project[]>([]);

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

  const [experiences, setExperiences] = useState<Experience[]>([]);
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

  const [contacts, setContacts] = useState<Contact[]>([]);

  const [loadingStates, setLoadingStates] = useState({
    skills: false,
    projects: false,
    experiences: false,
    contacts: false
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const fetchData = async () => {
    setLoadingStates(prev => ({ ...prev, skills: true }));
    setError(null);

    try {
      const skillsRes = await api.get<Skill[]>('/skills');
      if (isErrorResponse(skillsRes)) throw new Error(skillsRes.error);
      setSkills(skillsRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoadingStates(prev => ({ ...prev, skills: false }));
    }
  };

  const fetchProjects = async () => {
    setLoadingStates(prev => ({ ...prev, projects: true }));
    setError(null);

    try {
      const projectsRes = await api.get<Project[]>('/projects');
      if (isErrorResponse(projectsRes)) throw new Error(projectsRes.error);
      setProjects(projectsRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoadingStates(prev => ({ ...prev, projects: false }));
    }
  };

  const fetchExperiences = async () => {
    setLoadingStates(prev => ({ ...prev, experiences: true }));
    setError(null);

    try {
      const experiencesRes = await api.get<Experience[]>('/experiences');
      if (isErrorResponse(experiencesRes)) throw new Error(experiencesRes.error);
      setExperiences(experiencesRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch experiences');
    } finally {
      setLoadingStates(prev => ({ ...prev, experiences: false }));
    }
  };

  const fetchContacts = async () => {
    setLoadingStates(prev => ({ ...prev, contacts: true }));
    setError(null);

    try {
      const contactsRes = await api.get<Contact[]>('/contact');
      if (isErrorResponse(contactsRes)) throw new Error(contactsRes.error);
      setContacts(contactsRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
    } finally {
      setLoadingStates(prev => ({ ...prev, contacts: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const uniqueCategories = [...new Set(skills.map(skill => skill.category))].filter(Boolean);
    setCategories(uniqueCategories);
  }, [skills]);

  useEffect(() => {
    if (activeTab === 'projects') {
      fetchProjects();
    } else if (activeTab === 'experiences') {
      fetchExperiences();
    } else if (activeTab === 'contacts') {
      fetchContacts();
    }
  }, [activeTab]);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      setCategories(prev => [...prev, newCategoryName.trim()]);
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);

    try {
      const response = await api.post<Skill>('/skills', newSkill);
      if (isErrorResponse(response)) throw new Error(response.error);
      setNewSkill({ name: '', category: '', proficiency: 0 });
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create skill');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill?._id) return;

    setSubmitLoading(true);
    setError(null);

    try {
      const response = await api.put<Skill>(`/skills/${editingSkill._id}`, editingSkill);
      if (isErrorResponse(response)) throw new Error(response.error);
      setEditingSkill(null);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update skill');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;

    setSubmitLoading(true);
    setError(null);

    try {
      const response = await api.delete(`/skills/${id}`);
      if (isErrorResponse(response)) throw new Error(response.error);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete skill');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);

    try {
      // Convert string dates to Date objects before submitting
      const dataToSubmit = {
        ...newProject,
        startDate: newProject.startDateStr ? new Date(newProject.startDateStr) : undefined,
        endDate: newProject.endDateStr ? new Date(newProject.endDateStr) : undefined
      };
      const response = await api.post<Project>('/projects', dataToSubmit);
      if (isErrorResponse(response)) throw new Error(response.error);
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
      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?._id) return;

    setSubmitLoading(true);
    setError(null);

    try {
      // Convert string dates to Date objects before submitting
      const dataToSubmit = {
        ...editingProject,
        startDate: editingProject.startDateStr ? new Date(editingProject.startDateStr) : undefined,
        endDate: editingProject.endDateStr ? new Date(editingProject.endDateStr) : undefined
      };
      const response = await api.put<Project>(`/projects/${editingProject._id}`, dataToSubmit);
      if (isErrorResponse(response)) throw new Error(response.error);
      setEditingProject(null);
      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    setSubmitLoading(true);
    setError(null);

    try {
      const response = await api.delete(`/projects/${id}`);
      if (isErrorResponse(response)) throw new Error(response.error);
      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCreateExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);

    try {
      // Convert string dates to Date objects before submitting
      const dataToSubmit = {
        ...newExperience,
        startDate: newExperience.startDateStr ? new Date(newExperience.startDateStr) : undefined,
        endDate: newExperience.endDateStr ? new Date(newExperience.endDateStr) : undefined
      };
      const response = await api.post<Experience>('/experiences', dataToSubmit);
      if (isErrorResponse(response)) throw new Error(response.error);
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
      await fetchExperiences();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create experience');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExperience?._id) return;

    setSubmitLoading(true);
    setError(null);

    try {
      // Convert string dates to Date objects before submitting
      const dataToSubmit = {
        ...editingExperience,
        startDate: editingExperience.startDateStr ? new Date(editingExperience.startDateStr) : undefined,
        endDate: editingExperience.endDateStr ? new Date(editingExperience.endDateStr) : undefined
      };
      const response = await api.put<Experience>(`/experiences/${editingExperience._id}`, dataToSubmit);
      if (isErrorResponse(response)) throw new Error(response.error);
      setEditingExperience(null);
      await fetchExperiences();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update experience');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) return;

    setSubmitLoading(true);
    setError(null);

    try {
      const response = await api.delete(`/experiences/${id}`);
      if (isErrorResponse(response)) throw new Error(response.error);
      await fetchExperiences();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete experience');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReplyToContact = async (id: string, reply: string) => {
    setSubmitLoading(true);
    setError(null);

    try {
      const response = await api.post(`/contact/${id}/reply`, { reply });
      if (isErrorResponse(response)) throw new Error(response.error);
      await fetchContacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reply to contact');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) return;

    setSubmitLoading(true);
    setError(null);

    try {
      const response = await api.delete(`/contact/${id}`);
      if (isErrorResponse(response)) throw new Error(response.error);
      await fetchContacts(); // Refresh the entire contact list after deletion
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100'}`}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 bg-red-500/10 border border-red-500/30 p-4 rounded-lg text-red-400"
            >
              {error}
              <Button 
                variant="secondary" 
                className="ml-4" 
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap gap-2 mb-8 p-2 bg-gray-800/30 backdrop-blur-sm rounded-lg">
          {['project-types', 'skills', 'projects', 'experiences', 'contacts', 'settings'].map((tab) => (
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
            {activeTab === 'skills' && (
              <div className="space-y-8">
                {/* Add/Edit Skill Form */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white/50'} p-6 rounded-lg border border-blue-500/30`}
                >
                  <h2 className="text-xl font-bold text-blue-400 mb-6">
                    {editingSkill ? 'Edit Skill' : 'Add New Skill'}
                  </h2>
                  
                  <form onSubmit={editingSkill ? handleEditSkill : handleCreateSkill} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                          Name
                        </label>
                        <input
                          type="text"
                          value={editingSkill?.name || newSkill.name}
                          onChange={e => editingSkill 
                            ? setEditingSkill({...editingSkill, name: e.target.value})
                            : setNewSkill({...newSkill, name: e.target.value})}
                          className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                          Category
                        </label>
                        {isAddingCategory ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newCategoryName}
                              onChange={e => setNewCategoryName(e.target.value)}
                              className={`flex-1 p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                              placeholder="Enter new category"
                              autoFocus
                            />
                            <Button onClick={handleAddCategory}>Add</Button>
                            <Button variant="secondary" onClick={() => {
                              setIsAddingCategory(false);
                              setNewCategoryName('');
                            }}>Cancel</Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <select
                              value={editingSkill?.category || newSkill.category}
                              onChange={e => editingSkill
                                ? setEditingSkill({...editingSkill, category: e.target.value})
                                : setNewSkill({...newSkill, category: e.target.value})}
                              className={`flex-1 p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                              required
                            >
                              <option value="">Select a category</option>
                              {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                            <Button variant="secondary" onClick={() => setIsAddingCategory(true)}>New</Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Proficiency
                        </label>
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                          {editingSkill?.proficiency || newSkill.proficiency}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editingSkill?.proficiency || newSkill.proficiency}
                        onChange={e => {
                          const value = parseInt(e.target.value);
                          editingSkill
                            ? setEditingSkill({...editingSkill, proficiency: value})
                            : setNewSkill({...newSkill, proficiency: value});
                        }}
                        className="w-full h-2 bg-gray-700/50 rounded-full appearance-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-blue-400 active:[&::-webkit-slider-thumb]:scale-110 transition-all duration-100"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 ${editingSkill?.proficiency || newSkill.proficiency}%, rgba(55, 65, 81, 0.5) ${editingSkill?.proficiency || newSkill.proficiency}%)`
                        }}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        isLoading={submitLoading}
                        loadingText={editingSkill ? "Updating..." : "Adding..."}
                      >
                        {editingSkill ? 'Update Skill' : 'Add Skill'}
                      </Button>
                      {editingSkill && (
                        <Button
                          variant="secondary"
                          onClick={() => setEditingSkill(null)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </motion.div>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {skills.map((skill) => (
                    <motion.div
                      key={skill._id}
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
                              {skill.name}
                            </h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                              {skill.category}
                            </p>
                          </div>
                          <span className={`text-lg ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} font-semibold`}>
                            {skill.proficiency}%
                          </span>
                        </div>

                        <div className="mt-4">
                          <div className="relative h-2 bg-gray-700/20 rounded-full overflow-hidden">
                            <div 
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300"
                              style={{ width: `${skill.proficiency}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="secondary"
                            onClick={() => setEditingSkill(skill)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDelete(skill._id!)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Other tabs content */}
            {activeTab === 'project-types' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white/50'} p-6 rounded-lg border border-blue-500/30`}
              >
                <h2 className="text-xl font-bold text-blue-400 mb-6">Manage Project Types</h2>
                <div className="flex gap-4 mb-6">
                  <input
                    type="text"
                    value={newProjectType}
                    onChange={(e) => setNewProjectType(e.target.value)}
                    placeholder="New project type"
                    className={`flex-1 p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                  />
                  <Button onClick={handleAddProjectType}>
                    Add Type
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projectTypes.map((type) => (
                    <div
                      key={type}
                      className={`relative group ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white/50'} p-4 rounded-lg border border-blue-500/30 hover:border-blue-400 transition-all duration-300`}
                    >
                      {editingProjectType?.oldType === type ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingProjectType.newType}
                            onChange={(e) => setEditingProjectType({ 
                              oldType: type, 
                              newType: e.target.value 
                            })}
                            className={`flex-1 p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                          />
                          <Button onClick={handleEditProjectType}>Save</Button>
                          <Button variant="secondary" onClick={() => setEditingProjectType(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{type}</span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="secondary" onClick={() => setEditingProjectType({ oldType: type, newType: type })}>Edit</Button>
                            <Button variant="danger" onClick={() => handleDeleteProjectType(type)}>Delete</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : activeTab === 'projects' ? (
              <div className="space-y-6">
                {loadingStates.projects ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center space-y-4">
                      <LoadingSpinner size="lg" />
                      <p className="text-blue-400">Loading projects...</p>
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
                                onClick={() => setEditingProject(project)}
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
            ) : activeTab === 'experiences' ? (
              <div className="space-y-6">
                {loadingStates.experiences ? (
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
            ) : activeTab === 'contacts' ? (
              <div className="space-y-6">
                {loadingStates.contacts ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center space-y-4">
                      <LoadingSpinner size="lg" />
                      <p className="text-blue-400">Loading contacts...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {contacts.map((contact) => (
                      <motion.div
                        key={contact.email}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`relative group ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white/50'} p-6 rounded-lg border border-blue-500/30 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className={`font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} text-lg`}>
                                {contact.name}
                              </h3>
                              <a 
                                href={`mailto:${contact.email}`} 
                                className="text-gray-400 hover:text-blue-400 transition-colors"
                              >
                                {contact.email}
                              </a>
                              <div className="mt-2">
                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                  contact.hasUnreplied
                                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                                    : 'bg-green-500/10 text-green-400 border-green-500/30'
                                } border`}>
                                  {contact.totalMessages} message{contact.totalMessages !== 1 ? 's' : ''} • {contact.hasUnreplied ? 'Has unreplied' : 'All replied'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {contact.messages.map((msg) => (
                            <div key={msg._id} className="mt-4 p-4 rounded-lg border border-blue-500/10 bg-blue-500/5">
                              <div className="flex justify-between items-start mb-2">
                                <p className="text-sm text-gray-500">
                                  {new Date(msg.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  msg.status === 'pending'
                                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                                    : 'bg-green-500/10 text-green-400 border-green-500/30'
                                } border`}>
                                  {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                                </span>
                              </div>
                              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>
                                {msg.message}
                              </p>

                              {msg.reply && msg.replyDate && (
                                <div className="mt-4 p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
                                  <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                    Your Reply:
                                  </h4>
                                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} whitespace-pre-wrap`}>
                                    {msg.reply}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-2">
                                    Replied on: {new Date(msg.replyDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              )}

                              <div className="mt-4 flex gap-3">
                                {msg.status === 'pending' && (
                                  <Button
                                    variant="secondary"
                                    onClick={() => {
                                      const el = document.getElementById(`reply-${msg._id}`) as HTMLTextAreaElement;
                                      if (el) el.focus();
                                    }}
                                  >
                                    Reply
                                  </Button>
                                )}
                                <Button
                                  variant="danger"
                                  onClick={() => handleDeleteContact(msg._id)}
                                  isLoading={submitLoading}
                                  loadingText="Deleting..."
                                >
                                  Delete
                                </Button>
                              </div>

                              {msg.status === 'pending' && (
                                <form 
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    const form = e.target as HTMLFormElement;
                                    const replyText = (form.elements.namedItem('reply') as HTMLTextAreaElement).value;
                                    if (replyText.trim()) {
                                      handleReplyToContact(msg._id, replyText.trim());
                                      form.reset();
                                    }
                                  }} 
                                  className="mt-4 space-y-4"
                                >
                                  <div>
                                    <label 
                                      htmlFor={`reply-${msg._id}`} 
                                      className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}
                                    >
                                      Write a Reply
                                    </label>
                                    <textarea
                                      id={`reply-${msg._id}`}
                                      name="reply"
                                      className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                                      rows={4}
                                      required
                                      placeholder="Type your reply here..."
                                    />
                                  </div>
                                  <Button 
                                    type="submit" 
                                    isLoading={submitLoading} 
                                    loadingText="Sending..."
                                  >
                                    Send Reply
                                  </Button>
                                </form>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === 'settings' ? (
              <div className="space-y-6">
                <Settings />
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}