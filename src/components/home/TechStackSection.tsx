import { motion } from 'framer-motion';
import { Skill } from '../../types';

interface TechStackSectionProps {
  skillsByCategory: { [key: string]: Skill[] };
}

export function TechStackSection({ skillsByCategory }: TechStackSectionProps) {
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

  if (Object.keys(skillsByCategory).length === 0) {
    return null;
  }

  return (
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
  );
}
