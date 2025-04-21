import { Request, Response } from 'express';
import { Contact } from '../models/Contact';
import nodemailer from 'nodemailer';

export const contactController = {
  // Submit contact form
  submitContact: async (req: Request, res: Response) => {
    try {
      const contact = new Contact(req.body);
      await contact.save();

      // Send email notification (configure with your email service)
      const transporter = nodemailer.createTransport({
        // Configure your email service here
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.ADMIN_EMAIL,
        subject: `New Contact Form Submission from ${contact.name}`,
        text: `
          Name: ${contact.name}
          Email: ${contact.email}
          Message: ${contact.message}
        `,
      });

      res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({ message: 'Error submitting contact form', error });
    }
  },

  // Get all contact submissions (admin only)
  getAllContacts: async (req: Request, res: Response) => {
    try {
      const contacts = await Contact.find().sort({ createdAt: -1 });
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching contacts', error });
    }
  }
};