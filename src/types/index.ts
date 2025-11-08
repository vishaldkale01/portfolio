export type ProjectType = 'backend' | 'frontend' | 'fullstack' | 'ai' | 'mobile';

export interface Project {
  _id?: string;
  title: string;
  description: string;
  techStack: string[];
  projectTypes: ProjectType[];
  startDate: Date;
  endDate?: Date;
  isCurrentProject: boolean;
  isVisible: boolean;
  displayOrder?: number;
}

export interface Skill {
  _id?: string;
  name: string;
  category: string;
  proficiency: number;
  isVisible: boolean;
  displayOrder?: number;
}

export interface Experience {
  _id?: string;
  company: string;
  role: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
  startDate: Date;
  endDate?: Date;
  isCurrentRole: boolean;
  isVisible: boolean;
  displayOrder?: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatBotState {
  isOpen: boolean;
  messages: ChatMessage[];
  loading: boolean;
}

export interface Settings {
  _id?: string;
  homePage: {
    title: string;
    subtitle: string;
    description: string;
    showChatBot: boolean;
  };
  contactPage: {
    title: string;
    subtitle: string;
    description: string;
    phone: string;
    email: string;
  };
  visibility: {
    showSkills: boolean;
    showProjects: boolean;
    showExperiences: boolean;
  };
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
  };
}

export interface ContactMessage {
  _id: string;
  message: string;
  createdAt: string;
  status: 'pending' | 'replied';
  reply?: string;
  replyDate?: string;
}

export interface Contact {
  email: string;
  name: string;
  messages: ContactMessage[];
  totalMessages: number;
  latestMessage: {
    message: string;
    createdAt: string;
  };
  hasUnreplied: boolean;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
}

export interface ApiErrorResponse {
  error: string;
  status: number;
}

export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Utility type to make some properties optional
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Form state types for better type safety in forms
export interface SkillFormState extends Omit<Skill, '_id'> {}
export interface ProjectFormState extends Omit<Project, '_id'> {}
export interface ExperienceFormState extends Omit<Experience, '_id'> {}
export interface ContactFormState extends Omit<Contact, '_id' | 'status' | 'reply' | 'replyDate' | 'createdAt'> {}

export interface ApiError {
  message: string;
  statusCode?: number;
}

export interface LoadingStates {
  skills: boolean;
  projects: boolean;
  experiences: boolean;
  contacts: boolean;
}

export interface FormState {
  isLoading: boolean;
  error: string | null;
}