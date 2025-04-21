export interface Project {
  _id?: string;
  title: string;
  description: string;
  techStack: string[];
  imageUrl?: string;
  demoLink?: string;
  githubLink?: string;
  isCurrentProject: boolean;
  progress?: number;
  startDate: Date;
  endDate?: Date;
}

export interface Skill {
  _id?: string;
  name: string;
  category: string;
  proficiency: number;
  icon?: string;
}

export interface Experience {
  _id?: string;
  company: string;
  role: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  responsibilities: string[];
  technologies: string[];
  isCurrentRole: boolean;
}