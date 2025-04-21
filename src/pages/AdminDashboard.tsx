import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { Project, Skill, Experience } from '../types';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('skills');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const { isAuthenticated, logout } = useAdmin();
  const navigate = useNavigate();

  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    name: '',
    category: '',
    proficiency: 0
  });

  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    techStack: [],
    isCurrentProject: false,
    startDate: new Date()
  });

  const [newExperience, setNewExperience] = useState<Partial<Experience>>({
    company: '',
    role: '',
    description: '',
    responsibilities: [''],
    technologies: [''],
    startDate: new Date(),
    isCurrentRole: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const fetchData = async () => {
    const token = localStorage.getItem('adminToken');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    try {
      const [skillsRes, projectsRes, experiencesRes, contactsRes] = await Promise.all([
        fetch('http://localhost:5000/api/skills', { headers }),
        fetch('http://localhost:5000/api/projects', { headers }),
        fetch('http://localhost:5000/api/experiences', { headers }),
        fetch('http://localhost:5000/api/contact', { headers })
      ]);

      setSkills(await skillsRes.json());
      setProjects(await projectsRes.json());
      setExperiences(await experiencesRes.json());
      setContacts(await contactsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (type: string, id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`http://localhost:5000/api/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch('http://localhost:5000/api/skills', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSkill)
      });

      if (response.ok) {
        setNewSkill({ name: '', category: '', proficiency: 0 });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating skill:', error);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProject)
      });

      if (response.ok) {
        setNewProject({
          title: '',
          description: '',
          techStack: [],
          isCurrentProject: false,
          startDate: new Date()
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleCreateExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch('http://localhost:5000/api/experiences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newExperience)
      });

      if (response.ok) {
        setNewExperience({
          company: '',
          role: '',
          description: '',
          responsibilities: [''],
          technologies: [''],
          startDate: new Date(),
          isCurrentRole: false
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating experience:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                  Admin Dashboard
                </h1>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="ml-4 px-4 py-2 text-sm text-red-600 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
          <nav className="-mb-px flex">
            {['skills', 'projects', 'experiences', 'contacts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`capitalize py-2 px-4 border-b-2 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          {activeTab === 'skills' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Skills Management</h2>
              
              {/* Add New Skill Form */}
              <form onSubmit={handleCreateSkill} className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={newSkill.name}
                    onChange={e => setNewSkill({...newSkill, name: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input
                    type="text"
                    value={newSkill.category}
                    onChange={e => setNewSkill({...newSkill, category: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Proficiency (%)</label>
                  <input
                    type="number"
                    value={newSkill.proficiency}
                    onChange={e => setNewSkill({...newSkill, proficiency: Number(e.target.value)})}
                    className="w-full p-2 border rounded"
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add Skill
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.map((skill) => (
                  <div key={skill._id} className="border p-4 rounded">
                    <h3 className="font-semibold">{skill.name}</h3>
                    <p>Category: {skill.category}</p>
                    <p>Proficiency: {skill.proficiency}%</p>
                    <button
                      onClick={() => handleDelete('skills', skill._id!)}
                      className="mt-2 text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Projects Management</h2>
              
              {/* Add New Project Form */}
              <form onSubmit={handleCreateProject} className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={newProject.title}
                    onChange={e => setNewProject({...newProject, title: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    value={newProject.techStack?.join(', ')}
                    onChange={e => setNewProject({
                      ...newProject,
                      techStack: e.target.value.split(',').map(tech => tech.trim())
                    })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newProject.isCurrentProject}
                    onChange={e => setNewProject({...newProject, isCurrentProject: e.target.checked})}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium">Current Project</label>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add Project
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div key={project._id} className="border p-4 rounded">
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.techStack.map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleDelete('projects', project._id!)}
                      className="mt-2 text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'experiences' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Experience Management</h2>
              
              {/* Add New Experience Form */}
              <form onSubmit={handleCreateExperience} className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input
                    type="text"
                    value={newExperience.company}
                    onChange={e => setNewExperience({...newExperience, company: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <input
                    type="text"
                    value={newExperience.role}
                    onChange={e => setNewExperience({...newExperience, role: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={newExperience.description}
                    onChange={e => setNewExperience({...newExperience, description: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Responsibilities (one per line)</label>
                  <textarea
                    value={newExperience.responsibilities?.join('\n')}
                    onChange={e => setNewExperience({
                      ...newExperience,
                      responsibilities: e.target.value.split('\n').filter(r => r.trim())
                    })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Technologies (comma-separated)</label>
                  <input
                    type="text"
                    value={newExperience.technologies?.join(', ')}
                    onChange={e => setNewExperience({
                      ...newExperience,
                      technologies: e.target.value.split(',').map(tech => tech.trim())
                    })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newExperience.isCurrentRole}
                    onChange={e => setNewExperience({...newExperience, isCurrentRole: e.target.checked})}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium">Current Role</label>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add Experience
                </button>
              </form>

              <div className="space-y-4">
                {experiences.map((experience) => (
                  <div key={experience._id} className="border p-4 rounded">
                    <h3 className="font-semibold">{experience.role}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {experience.company}
                    </p>
                    <button
                      onClick={() => handleDelete('experiences', experience._id!)}
                      className="mt-2 text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Contact Messages</h2>
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact._id} className="border p-4 rounded">
                    <h3 className="font-semibold">{contact.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {contact.email}
                    </p>
                    <p className="mt-2">{contact.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}