import { Schema, model } from 'mongoose';

interface IAdmin {
  username: string;
  password: string;
  email: string;
  createdAt: Date;
}

const adminSchema = new Schema<IAdmin>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

export const Admin = model<IAdmin>('Admin', adminSchema);