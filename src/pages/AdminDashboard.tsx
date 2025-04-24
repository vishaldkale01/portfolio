import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';
import { api } from '../utils/api';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Skill, Project, Experience, Contact, ApiErrorResponse } from '../types';

type ProjectType = 'backend' | 'frontend' | 'fullstack' | 'ai' | 'mobile';

const isErrorResponse = (res: any): res is ApiErrorResponse => {
  return 'error' in res && 'status' in res;
};

export function AdminDashboard() {
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
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    techStack: [],
    projectTypes: [],
    isCurrentProject: false,
    startDate: new Date()
  });
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [newExperience, setNewExperience] = useState<Partial<Experience>>({
    company: '',
    role: '',
    description: '',
    startDate: new Date(),
    responsibilities: [],
    technologies: [],
    isCurrentRole: false
  });
  const [editingExperience, setEditingExperience] = useState<Partial<Experience> | null>(null);

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
      const response = await api.post<Project>('/projects', newProject);
      if (isErrorResponse(response)) throw new Error(response.error);
      setNewProject({
        title: '',
        description: '',
        techStack: [],
        projectTypes: [],
        isCurrentProject: false,
        startDate: new Date()
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
      const response = await api.put<Project>(`/projects/${editingProject._id}`, editingProject);
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
      const response = await api.post<Experience>('/experiences', newExperience);
      if (isErrorResponse(response)) throw new Error(response.error);
      setNewExperience({
        company: '',
        role: '',
        description: '',
        startDate: new Date(),
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
      const response = await api.put<Experience>(`/experiences/${editingExperience._id}`, editingExperience);
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
      await fetchContacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400"
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
        <nav className="flex space-x-4 border-b border-gray-800 mb-6">
          {['project-types', 'skills', 'projects', 'experiences', 'contacts'].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab)}
              className="capitalize"
            >
              {tab.replace('-', ' ')}
            </Button>
          ))}
        </nav>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-900/50 rounded-lg p-6"
          >
            {activeTab === 'project-types' ? (
              <div className="space-y-6">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-blue-400 mb-4">Manage Project Types</h3>
                  <div className="flex gap-4 mb-6">
                    <input
                      type="text"
                      value={newProjectType}
                      onChange={(e) => setNewProjectType(e.target.value)}
                      placeholder="New project type"
                      className="flex-1 p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
                    />
                    <Button onClick={handleAddProjectType}>
                      Add Type
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projectTypes.map((type) => (
                      <div
                        key={type}
                        className="relative bg-gray-800/50 p-4 rounded-lg border border-blue-500/30 hover:border-blue-400 transition-all duration-300 group"
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
                              className="flex-1 p-2 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
                            />
                            <Button
                              variant="primary"
                              onClick={handleEditProjectType}
                              className="px-3"
                            >
                              Save
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => setEditingProjectType(null)}
                              className="px-3"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">{type}</span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="secondary"
                                onClick={() => setEditingProjectType({ oldType: type, newType: type })}
                                className="px-3"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                onClick={() => handleDeleteProjectType(type)}
                                className="px-3"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeTab === 'skills' ? (
              <div className="space-y-6">
                <form onSubmit={editingSkill ? handleEditSkill : handleCreateSkill} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                      <input
                        type="text"
                        value={editingSkill?.name || newSkill.name}
                        onChange={e => editingSkill 
                          ? setEditingSkill({...editingSkill, name: e.target.value})
                          : setNewSkill({...newSkill, name: e.target.value})}
                        className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                      <div className="relative">
                        {isAddingCategory ? (
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={newCategoryName}
                              onChange={e => setNewCategoryName(e.target.value)}
                              className="flex-1 p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
                              placeholder="Enter new category"
                              autoFocus
                            />
                            <Button
                              onClick={handleAddCategory}
                              variant="primary"
                            >
                              Add
                            </Button>
                            <Button
                              onClick={() => {
                                setIsAddingCategory(false);
                                setNewCategoryName('');
                              }}
                              variant="secondary"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <select
                              value={editingSkill?.category || newSkill.category}
                              onChange={e => editingSkill
                                ? setEditingSkill({...editingSkill, category: e.target.value})
                                : setNewSkill({...newSkill, category: e.target.value})}
                              className="flex-1 p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
                              required
                            >
                              <option value="">Select a category</option>
                              {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                            <Button
                              onClick={() => setIsAddingCategory(true)}
                              variant="secondary"
                            >
                              New Category
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Proficiency</label>
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
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-sm text-gray-400 mt-1">
                      {editingSkill?.proficiency || newSkill.proficiency}%
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {skills.map((skill) => (
                    <motion.div
                      key={skill._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="relative bg-gray-900/50 p-6 rounded-lg border border-blue-500/30 hover:border-blue-400 transition-all duration-300 group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-lg"></div>
                      <div className="relative">
                        <h3 className="font-bold text-blue-400">{skill.name}</h3>
                        <p className="text-gray-400">Category: {skill.category}</p>
                        <div className="mt-2">
                          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300"
                              style={{ width: `${skill.proficiency}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">Proficiency: {skill.proficiency}%</p>
                        </div>
                        <div className="mt-4 flex space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    <form onSubmit={editingProject ? handleEditProject : handleCreateProject} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                          <input
                            type="text"
                            value={editingProject?.title || newProject.title}
                            onChange={e => editingProject
                              ? setEditingProject({...editingProject, title: e.target.value})
                              : setNewProject({...newProject, title: e.target.value})}
                            className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                          <textarea
                            value={editingProject?.description || newProject.description}
                            onChange={e => editingProject
                              ? setEditingProject({...editingProject, description: e.target.value})
                              : setNewProject({...newProject, description: e.target.value})}
                            className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
                            rows={3}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Project Types</label>
                        <div className="flex flex-wrap gap-3">
                          {projectTypes.map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                const currentTypes = editingProject?.projectTypes || newProject.projectTypes || [];
                                const updatedTypes = currentTypes.includes(type)
                                  ? currentTypes.filter(t => t !== type)
                                  : [...currentTypes, type]
                                
                                editingProject
                                  ? setEditingProject({...editingProject, projectTypes: updatedTypes})
                                  : setNewProject({...newProject, projectTypes: updatedTypes});
                              }}
                              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                                (editingProject?.projectTypes || newProject.projectTypes || []).includes(type)
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                              }`}
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tech Stack</label>
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
                          className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={editingProject?.startDate?.toString().split('T')[0] || newProject.startDate?.toString().split('T')[0]}
                            onChange={e => {
                              const startDate = new Date(e.target.value);
                              editingProject
                                ? setEditingProject({...editingProject, startDate})
                                : setNewProject({...newProject, startDate});
                            }}
                            className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                          <input
                            type="date"
                            value={editingProject?.endDate?.toString().split('T')[0] || ''}
                            onChange={e => {
                              const endDate = e.target.value ? new Date(e.target.value) : undefined;
                              editingProject
                                ? setEditingProject({...editingProject, endDate})
                                : setNewProject({...newProject, endDate});
                            }}
                            className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
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
                          className="h-4 w-4 text-blue-500 border-blue-500/30 rounded focus:ring-blue-400"
                        />
                        <label className="text-sm font-medium text-gray-300">Current Project</label>
                      </div>

                      <div className="flex space-x-4">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {projects.map((project) => (
                        <motion.div
                          key={project._id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="relative bg-gray-900/50 p-6 rounded-lg border border-blue-500/30 hover:border-blue-400 transition-all duration-300 group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-lg"></div>
                          <div className="relative">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-blue-400">{project.title}</h3>
                              {project.isCurrentProject && (
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                                  Current Project
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-gray-300">{project.description}</p>

                            <div className="mt-4 flex flex-wrap gap-2">
                              {project.techStack.map((tech, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>

                            <div className="mt-4 text-sm text-gray-400">
                              <p>Started: {new Date(project.startDate).toLocaleDateString()}</p>
                              {project.endDate && (
                                <p>Completed: {new Date(project.endDate).toLocaleDateString()}</p>
                              )}
                            </div>

                            <div className="mt-4 flex space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    <form onSubmit={editingExperience ? handleEditExperience : handleCreateExperience} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                          <input
                            type="text"
                            value={editingExperience?.company || newExperience.company}
                            onChange={e => editingExperience
                              ? setEditingExperience({...editingExperience, company: e.target.value})
                              : setNewExperience({...newExperience, company: e.target.value})}
                            className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                          <input
                            type="text"
                            value={editingExperience?.role || newExperience.role}
                            onChange={e => editingExperience
                              ? setEditingExperience({...editingExperience, role: e.target.value})
                              : setNewExperience({...newExperience, role: e.target.value})}
                            className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea
                          value={editingExperience?.description || newExperience.description}
                          onChange={e => editingExperience
                            ? setEditingExperience({...editingExperience, description: e.target.value})
                            : setNewExperience({...newExperience, description: e.target.value})}
                          className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
                          rows={3}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Technologies</label>
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
                          className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Responsibilities</label>
                        <textarea
                          value={(editingExperience?.responsibilities || newExperience.responsibilities || []).join('\n')}
                          onChange={e => {
                            const responsibilities = e.target.value.split('\n').map(r => r.trim()).filter(Boolean);
                            editingExperience
                              ? setEditingExperience({...editingExperience, responsibilities})
                              : setNewExperience({...newExperience, responsibilities});
                          }}
                          placeholder="Enter responsibilities (one per line)"
                          className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={editingExperience?.startDate?.toString().split('T')[0] || newExperience.startDate?.toString().split('T')[0]}
                            onChange={e => {
                              const startDate = new Date(e.target.value);
                              editingExperience
                                ? setEditingExperience({...editingExperience, startDate})
                                : setNewExperience({...newExperience, startDate});
                            }}
                            className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                          <input
                            type="date"
                            value={editingExperience?.endDate?.toString().split('T')[0] || ''}
                            onChange={e => {
                              const endDate = e.target.value ? new Date(e.target.value) : undefined;
                              editingExperience
                                ? setEditingExperience({...editingExperience, endDate})
                                : setNewExperience({...newExperience, endDate});
                            }}
                            className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
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
                          className="h-4 w-4 text-blue-500 border-blue-500/30 rounded focus:ring-blue-400"
                        />
                        <label className="text-sm font-medium text-gray-300">Current Role</label>
                      </div>

                      <div className="flex space-x-4">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {experiences.map((experience) => (
                        <motion.div
                          key={experience._id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="relative bg-gray-900/50 p-6 rounded-lg border border-blue-500/30 hover:border-blue-400 transition-all duration-300 group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-lg"></div>
                          <div className="relative">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-blue-400">{experience.company}</h3>
                                <p className="text-gray-300">{experience.role}</p>
                              </div>
                              {experience.isCurrentRole && (
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                                  Current Role
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-gray-300">{experience.description}</p>

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
                              <p>Started: {new Date(experience.startDate).toLocaleDateString()}</p>
                              {experience.endDate && (
                                <p>Ended: {new Date(experience.endDate).toLocaleDateString()}</p>
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
                        key={contact._id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="relative bg-gray-900/50 p-6 rounded-lg border border-blue-500/30 hover:border-blue-400 transition-all duration-300 group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-lg"></div>
                        <div className="relative">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-blue-400">{contact.name}</h3>
                              <a href={`mailto:${contact.email}`} className="text-gray-300 hover:text-blue-400 transition-colors">
                                {contact.email}
                              </a>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              contact.status === 'pending'
                                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                                : 'bg-green-500/10 text-green-400 border-green-500/30'
                            } border`}>
                              {contact.status === 'pending' ? 'Pending' : 'Replied'}
                            </span>
                          </div>

                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-400 mb-2">Message:</h4>
                            <p className="text-gray-300 whitespace-pre-wrap">{contact.message}</p>
                          </div>

                          {contact.reply && (
                            <div className="mt-4">
                              <h4 className="text-sm font-semibold text-gray-400 mb-2">Reply:</h4>
                              <p className="text-gray-300 whitespace-pre-wrap">{contact.reply}</p>
                              <p className="text-sm text-gray-400 mt-2">
                                Replied on: {new Date(contact.replyDate!).toLocaleDateString()}
                              </p>
                            </div>
                          )}

                          <div className="mt-4 text-sm text-gray-400">
                            Received: {new Date(contact.createdAt).toLocaleDateString()}
                          </div>

                          {contact.status === 'pending' && (
                            <form onSubmit={e => {
                              e.preventDefault();
                              const reply = (e.currentTarget.elements.namedItem('reply') as HTMLTextAreaElement).value;
                              handleReplyToContact(contact._id!, reply);
                              e.currentTarget.reset();
                            }} className="mt-4 space-y-4">
                              <div>
                                <label htmlFor={`reply-${contact._id}`} className="block text-sm font-medium text-gray-300 mb-2">
                                  Write a Reply
                                </label>
                                <textarea
                                  id={`reply-${contact._id}`}
                                  name="reply"
                                  className="w-full p-3 bg-black/50 border border-blue-500/30 rounded-lg text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
                                  rows={4}
                                  required
                                />
                              </div>
                              <Button type="submit" isLoading={submitLoading} loadingText="Sending...">
                                Send Reply
                              </Button>
                            </form>
                          )}

                          <div className="mt-4 flex space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="danger"
                              onClick={() => handleDeleteContact(contact._id!)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}