import { Schema, model } from 'mongoose';

interface ISettings {
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

const settingsSchema = new Schema<ISettings>({
  homePage: {
    title: { type: String, default: 'Welcome to My Portfolio' },
    subtitle: { type: String, default: 'Full Stack Developer' },
    description: { type: String, default: 'I build modern web applications with cutting-edge technologies' },
    showChatBot: { type: Boolean, default: true }
  },
  contactPage: {
    title: { type: String, default: "Let's Connect" },
    subtitle: { type: String, default: 'Get in Touch' },
    description: { type: String, default: 'I am open to discussing new projects and opportunities' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  visibility: {
    showSkills: { type: Boolean, default: true },
    showProjects: { type: Boolean, default: true },
    showExperiences: { type: Boolean, default: true }
  },
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' }
  }
});

export const Settings = model<ISettings>('Settings', settingsSchema);