import { Schema, model } from 'mongoose';

interface IProject {
  title: string;
  description: string;
  techStack: string[];
  projectTypes: string[];  // Added this field
  imageUrl?: string;
  demoLink?: string;
  githubLink?: string;
  isCurrentProject: boolean;
  progress?: number;
  startDate: Date;
  endDate?: Date;
}

const projectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  techStack: [{ type: String }],
  projectTypes: [{ 
    type: String, 
    enum: ['backend', 'frontend', 'fullstack', 'ai', 'mobile'],
    required: true 
  }],
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isCurrentProject: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Project = model<IProject>('Project', projectSchema);