import { Request, Response } from 'express';
import { Contact } from '../models/Contact';
import nodemailer from 'nodemailer';

export const contactController = {
  // Submit contact form
  submitContact: async (req: Request, res: Response) => {
    try {
      const { name, email, message } = req.body;

      // Validate required fields
      if (!name || !email || !message) {
        return res.status(400).json({ 
          message: 'Please provide all required fields: name, email, and message' 
        });
      }

      // Create and save new contact
      const contact = new Contact({
        name,
        email,
        message
      });
      
      await contact.save();

      // Only attempt to send email if SMTP settings are configured
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
            subject: `New Contact Form Submission from ${name}`,
            text: `
              Name: ${name}
              Email: ${email}
              Message: ${message}
            `,
          });
        } catch (emailError) {
          console.error('Email notification failed:', emailError);
          // Continue execution even if email fails
        }
      }

      res.status(201).json({ 
        message: 'Message sent successfully',
        data: { id: contact._id }
      });
    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({ 
        message: 'Error submitting contact form. Please try again later.' 
      });
    }
  },

  // Get all contact submissions (admin only)
  getAllContacts: async (req: Request, res: Response) => {
    try {
      const contacts = await Contact.find().sort({ createdAt: -1 });
      
      // Group contacts by email
      const groupedContacts = contacts.reduce((groups: any, contact) => {
        const email = contact.email;
        if (!groups[email]) {
          groups[email] = {
            email,
            name: contact.name,
            messages: [],
            totalMessages: 0,
            latestMessage: null,
            hasUnreplied: false
          };
        }
        
        groups[email].messages.push({
          _id: contact._id,
          message: contact.message,
          createdAt: contact.createdAt,
          status: contact.status,
          reply: contact.reply,
          replyDate: contact.replyDate
        });
        
        groups[email].totalMessages++;
        
        // Update latest message
        if (!groups[email].latestMessage || new Date(contact.createdAt) > new Date(groups[email].latestMessage.createdAt)) {
          groups[email].latestMessage = {
            message: contact.message,
            createdAt: contact.createdAt
          };
        }
        
        // Check if there are any unreplied messages
        if (contact.status === 'pending') {
          groups[email].hasUnreplied = true;
        }
        
        return groups;
      }, {});

      // Convert grouped object to array and sort by latest message date
      const groupedArray = Object.values(groupedContacts).sort((a: any, b: any) => 
        new Date(b.latestMessage.createdAt).getTime() - new Date(a.latestMessage.createdAt).getTime()
      );

      res.json(groupedArray);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching contacts', error });
    }
  },

  // Reply to a contact message
  replyToContact: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reply } = req.body;

      const contact = await Contact.findById(id);
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      // Update contact with reply
      contact.reply = reply;
      contact.replyDate = new Date();
      contact.status = 'replied';
      await contact.save();

      // Send reply email
      const transporter = nodemailer.createTransport({
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
        to: contact.email,
        subject: `Re: Your message to Vishal Kale`,
        text: reply,
        replyTo: process.env.SMTP_FROM,
      });

      res.json({ message: 'Reply sent successfully', contact });
    } catch (error) {
      console.error('Reply error:', error);
      res.status(500).json({ message: 'Error sending reply', error });
    }
  },

  // Delete contact message
  deleteContact: async (req: Request, res: Response) => {
    try {
      const contact = await Contact.findByIdAndDelete(req.params.id);
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting contact', error });
    }
  }
};