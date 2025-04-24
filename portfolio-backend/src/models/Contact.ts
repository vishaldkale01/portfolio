import { Schema, model } from 'mongoose';

interface IContact {
  name: string;
  email: string;
  message: string;
  createdAt: Date;
  status: 'pending' | 'replied';
  reply?: string;
  replyDate?: Date;
}

const contactSchema = new Schema<IContact>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'replied'], default: 'pending' },
  reply: String,
  replyDate: Date
});

export const Contact = model<IContact>('Contact', contactSchema);