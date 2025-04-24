import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Skill, Project, Experience, ApiResponse, ApiErrorResponse } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skillsByCategory, setSkillsByCategory] = useState<{ [key: string]: Skill[] }>({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [skillsRes, projectsRes, experiencesRes] = await Promise.all([
          api.get<Skill[]>('/skills'),
          api.get<Project[]>('/projects'),
          api.get<Experience[]>('/experiences')
        ]);

        const isErrorResponse = (res: ApiResponse<any>): res is ApiErrorResponse => {
          return 'error' in res && 'status' in res;
        };

        if (isErrorResponse(skillsRes)) throw new Error(skillsRes.error);
        if (isErrorResponse(projectsRes)) throw new Error(projectsRes.error);
        if (isErrorResponse(experiencesRes)) throw new Error(experiencesRes.error);

        setProjects(projectsRes.data || []);
        setExperiences(experiencesRes.data || []);
        
        // Group skills by category
        const grouped = (skillsRes.data || []).reduce<{ [key: string]: Skill[] }>((acc, skill) => {
          const category = skill.category || 'Other';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(skill);
          return acc;
        }, {});
        
        setSkillsByCategory(grouped);
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
              Backend Developer
            </span>
            <br />
            <span className="text-gray-700 dark:text-gray-300">
              with AI Expertise
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12">
            Building robust backend systems and exploring the frontiers of artificial intelligence
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

      {/* Projects Section */}
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
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Contact form or information can go here */}
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