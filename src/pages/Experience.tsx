import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Experience as ExperienceType } from '../types';
import { api } from '../utils/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function Experience() {
  const [experiences, setExperiences] = useState<ExperienceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<ExperienceType[]>('/experiences');
        if ('error' in response) {
          throw new Error(response.error);
        }
        setExperiences(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch experiences');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen neural-bg flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-primary">Loading experiences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen neural-bg py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-title inline-block"
          >
            Professional Experience
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-xl text-gray-600 dark:text-gray-400"
          >
            My journey in Backend Development and AI/ML
          </motion.p>
        </div>

        {/* Timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          {/* Timeline line */}
          <div className="absolute left-0 md:left-1/2 top-0 h-full w-px bg-gradient-to-b from-primary/50 to-secondary/50" />

          {experiences.map((experience, index) => (
            <motion.div
              key={experience._id}
              variants={itemVariants}
              className={`relative grid grid-cols-1 md:grid-cols-2 gap-8 mb-12`}
            >
              {/* Timeline dot */}
              <div className="hidden md:block absolute left-1/2 top-0 w-4 h-4 -ml-2 rounded-full bg-gradient-to-r from-primary to-secondary shadow-lg" />

              {/* Content */}
              <div className={`tech-card ${
                index % 2 === 0 
                  ? 'md:mr-8 md:text-right' 
                  : 'md:ml-8 md:col-start-2 md:text-left'
              }`}>
                <div className="relative z-10">
                  <span className="text-sm font-mono text-primary block">
                    {new Date(experience.startDate).toLocaleDateString()} - {
                      experience.isCurrentRole 
                        ? 'Present' 
                        : experience.endDate 
                          ? new Date(experience.endDate).toLocaleDateString()
                          : ''
                    }
                  </span>
                  <h3 className="text-xl font-mono font-bold mt-1 mb-2 group-hover:text-primary transition-colors">
                    {experience.role}
                  </h3>
                  <h4 className="text-lg text-gray-600 dark:text-gray-400 mb-4">{experience.company}</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 whitespace-pre-line">{experience.description}</p>

                  {/* Technologies */}
                  <div className={`flex flex-wrap gap-2 mb-4 ${
                    index % 2 === 0 
                      ? 'md:justify-end' 
                      : 'md:justify-start'
                  }`}>
                    {experience.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Responsibilities */}
                  <ul className={`space-y-2 ${
                    index % 2 === 0 
                      ? 'md:ml-auto' 
                      : ''
                  }`}>
                    {experience.responsibilities.map((responsibility, i) => (
                      <li key={i} className={`flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 ${
                        index % 2 === 0 
                          ? 'md:flex-row-reverse' 
                          : ''
                      }`}>
                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}