import { Schema, model } from 'mongoose';

interface IProject {
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

const projectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  techStack: [{ type: String, required: true }],
  imageUrl: String,
  demoLink: String,
  githubLink: String,
  isCurrentProject: { type: Boolean, default: false },
  progress: { type: Number, min: 0, max: 100 },
  startDate: { type: Date, required: true },
  endDate: Date
}, { timestamps: true });

export const Project = model<IProject>('Project', projectSchema);