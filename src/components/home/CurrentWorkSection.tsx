import { motion } from 'framer-motion';
import { Project, Experience } from '../../types';

interface CurrentWorkSectionProps {
  projects: Project[];
  experiences: Experience[];
}

export function CurrentWorkSection({ projects, experiences }: CurrentWorkSectionProps) {
  const currentExperiences = experiences.filter(exp => exp.isCurrentRole);
  const currentProjects = projects.filter(p => p.isCurrentProject);

  if (currentExperiences.length === 0 && currentProjects.length === 0) {
    return null;
  }

  return (
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
        {currentExperiences.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {currentExperiences.map(experience => (
              <div key={experience._id} className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {experience.role}
                </h3>
                <h4 className="text-lg text-primary mb-4">
                  {experience.company}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {experience.description}
                </p>
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

        {currentProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
              Recent Projects
            </h3>
            <div className="space-y-6">
              {currentProjects.map(project => (
                <div key={project._id} className="tech-card group">
                  <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {project.title}
                  </h4>
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
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {project.description}
                  </p>
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
  );
}
