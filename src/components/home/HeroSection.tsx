import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
}

export function HeroSection({ title, subtitle, description }: HeroSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="section-shell pt-14 md:pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight font-bold mb-6">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {title}
          </span>
          <br />
          <span className="text-gray-700 dark:text-gray-300 block mt-1">
            {subtitle}
          </span>
        </h1>
        <p className="section-intro mb-10">
          {description}
        </p>
        
        <div className="flex justify-center gap-3 sm:gap-4 flex-wrap">
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
  );
}
