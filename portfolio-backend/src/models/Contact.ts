import { Schema, model } from 'mongoose';

interface IContact {
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

const contactSchema = new Schema<IContact>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Contact = model<IContact>('Contact', contactSchema);