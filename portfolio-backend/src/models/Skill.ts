import { Schema, model } from 'mongoose';

interface ISkill {
  name: string;
  category: string;
  proficiency: number;
  icon?: string;
}

const skillSchema = new Schema<ISkill>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  proficiency: { type: Number, required: true, min: 0, max: 100 },
  icon: String
}, { timestamps: true });

export const Skill = model<ISkill>('Skill', skillSchema);