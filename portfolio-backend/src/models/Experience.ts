import { Schema, model } from 'mongoose';

interface IExperience {
  company: string;
  role: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  responsibilities: string[];
  technologies: string[];
  isCurrentRole: boolean;
}

const experienceSchema = new Schema<IExperience>({
  company: { type: String, required: true },
  role: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: Date,
  responsibilities: [{ type: String, required: true }],
  technologies: [{ type: String, required: true }],
  isCurrentRole: { type: Boolean, default: false }
}, { timestamps: true });

export const Experience = model<IExperience>('Experience', experienceSchema);