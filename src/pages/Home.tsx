import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Skill, Project, Experience, ApiResponse, ApiErrorResponse, Settings } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skillsByCategory, setSkillsByCategory] = useState<{ [key: string]: Skill[] }>({});
  const [settings, setSettings] = useState({
    homePage: {
      title: 'Welcome to My Portfolio',
      subtitle: 'Full Stack Developer',
      description: 'I build modern web applications with cutting-edge technologies'
    },
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: ''
    }
  });

  useEffect(() => {
    const handleSettingsUpdate = (event: CustomEvent<Settings>) => {
      setSettings({
        homePage: event.detail.homePage,
        socialLinks: event.detail.socialLinks
      });
    };

    window.addEventListener('settings:updated', handleSettingsUpdate as EventListener);
    return () => {
      window.removeEventListener('settings:updated', handleSettingsUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [skillsRes, projectsRes, experiencesRes, settingsRes] = await Promise.all([
          api.get<ApiResponse<Skill[]>>('/skills'),
          api.get<ApiResponse<Project[]>>('/projects'),
          api.get<ApiResponse<Experience[]>>('/experiences'),
          api.get<ApiResponse<Settings>>('/settings')
        ]);

        const isErrorResponse = (res: ApiResponse<any>): res is ApiErrorResponse => {
          return 'error' in res && 'status' in res;
        };

        if (isErrorResponse(skillsRes)) throw new Error(skillsRes.error);
        if (isErrorResponse(projectsRes)) throw new Error(projectsRes.error);
        if (isErrorResponse(experiencesRes)) throw new Error(experiencesRes.error);
        if (isErrorResponse(settingsRes)) throw new Error(settingsRes.error);

        // Type assertion to get proper typing
        const skillsData = ('data' in skillsRes ? skillsRes.data : []) as Skill[];
        const projectsData = ('data' in projectsRes ? projectsRes.data : []) as Project[];
        const experiencesData = ('data' in experiencesRes ? experiencesRes.data : []) as Experience[];
        const settingsData = ('data' in settingsRes ? settingsRes.data : null) as Settings | null;

        if (settingsData) {
          setSettings({
            homePage: settingsData.homePage,
            socialLinks: settingsData.socialLinks
          });

          if (settingsData.visibility) {
            if (!settingsData.visibility.showSkills) {
              setSkillsByCategory({});
            } else {
              // Group skills by category
              const grouped = skillsData.reduce<{ [key: string]: Skill[] }>(
                (acc: { [key: string]: Skill[] }, skill: Skill) => {
                  const category = skill.category || 'Other';
                  if (!acc[category]) {
                    acc[category] = [];
                  }
                  acc[category].push(skill);
                  return acc;
                },
                {}
              );
              setSkillsByCategory(grouped);
            }

            if (!settingsData.visibility.showProjects) {
              setProjects([]);
            } else {
              setProjects(projectsData);
            }

            if (!settingsData.visibility.showExperiences) {
              setExperiences([]);
            } else {
              setExperiences(experiencesData);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen neural-bg flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-primary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen neural-bg">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {settings.homePage.title}
            </span>
            <br />
            <span className="text-gray-700 dark:text-gray-300">
              {settings.homePage.subtitle}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12">
            {settings.homePage.description}
          </p>
          
          <div className="flex justify-center gap-4">
            <motion.button
              onClick={() => navigate('/contact')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="button-primary"
            >
              Get in Touch
            </motion.button>
            <motion.button
              onClick={() => navigate('/projects')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="button-secondary"
            >
              View Projects
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Skills/Tech Stack Section */}
      {Object.keys(skillsByCategory).length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-title text-center mb-16"
          >
            Tech Stack
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {Object.entries(skillsByCategory).map(([category, skills]) => (
              <motion.div
                key={category}
                variants={itemVariants}
                className="tech-card group"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative z-10">
                  <h3 className="text-lg font-mono font-semibold mb-3 group-hover:text-primary transition-colors capitalize">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {skills.map((skill) => (
                      <span
                        key={skill._id}
                        className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Projects and Experience Section */}
      {(projects.length > 0 || experiences.length > 0) && (
        <section id="projects" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-title text-center mb-16"
          >
            Current Work
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {experiences.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                {experiences.filter(exp => exp.isCurrentRole).map(experience => (
                  <div key={experience._id} className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">{experience.role}</h3>
                    <h4 className="text-lg text-primary mb-4">{experience.company}</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{experience.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {experience.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <ul className="space-y-2">
                      {experience.responsibilities.map((resp, index) => (
                        <li key={index} className="flex items-start space-x-2 text-gray-700 dark:text-gray-300">
                          <svg className="w-5 h-5 mt-1 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </motion.div>
            )}

            {projects.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Recent Projects</h3>
                <div className="space-y-6">
                  {projects.filter(p => p.isCurrentProject).map(project => (
                    <div key={project._id} className="tech-card group">
                      <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{project.title}</h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.projectTypes.map((type) => (
                          <span 
                            key={type}
                            className="px-2 py-1 text-xs rounded-full bg-secondary/10 text-secondary"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 text-sm bg-secondary/10 text-secondary rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Social Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-center space-x-6">
          {settings.socialLinks.github && (
            <a
              href={settings.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.607 9.607 0 0112 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48C19.137 20.107 22 16.373 22 11.969 22 6.463 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          )}
          {settings.socialLinks.linkedin && (
            <a
              href={settings.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          )}
          {settings.socialLinks.twitter && (
            <a
              href={settings.socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
          )}
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}