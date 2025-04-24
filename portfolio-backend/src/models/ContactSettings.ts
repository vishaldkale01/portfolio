import { Schema, model } from 'mongoose';

interface IContactSettings {
  connectWithMeTitle: string;
  openForOpportunitiesTitle: string;
  openForOpportunitiesText: string;
  githubLink: string;
  linkedinLink: string;
  email: string;
  phone: string;
  lastUpdated: Date;
}

const contactSettingsSchema = new Schema<IContactSettings>({
  connectWithMeTitle: { type: String, default: 'Connect With Me' },
  openForOpportunitiesTitle: { type: String, default: 'Open for Opportunities' },
  openForOpportunitiesText: { 
    type: String, 
    default: "I'm currently interested in new backend development opportunities, especially in real-time systems and Node.js projects. Feel free to reach out if you'd like to discuss potential collaboration!" 
  },
  githubLink: { type: String, default: 'https://github.com/vishaldkale01' },
  linkedinLink: { type: String, default: 'https://www.linkedin.com/in/vishal-kale-72b261218' },
  email: { type: String, default: 'contact@example.com' },
  phone: { type: String, default: '+1234567890' },
  lastUpdated: { type: Date, default: Date.now }
});

export const ContactSettings = model<IContactSettings>('ContactSettings', contactSettingsSchema);