import { Request, Response } from 'express';
import { ContactSettings } from '../models/ContactSettings';

export const contactSettingsController = {
  // Get contact settings
  getSettings: async (req: Request, res: Response) => {
    try {
      let settings = await ContactSettings.findOne();
      
      // If no settings exist, create default settings
      if (!settings) {
        settings = await ContactSettings.create({});
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching contact settings', error });
    }
  },

  // Update contact settings
  updateSettings: async (req: Request, res: Response) => {
    try {
      let settings = await ContactSettings.findOne();
      
      // If no settings exist, create new settings
      if (!settings) {
        settings = new ContactSettings(req.body);
      } else {
        // Update existing settings
        settings.connectWithMeTitle = req.body.connectWithMeTitle || settings.connectWithMeTitle;
        settings.openForOpportunitiesTitle = req.body.openForOpportunitiesTitle || settings.openForOpportunitiesTitle;
        settings.openForOpportunitiesText = req.body.openForOpportunitiesText || settings.openForOpportunitiesText;
        settings.githubLink = req.body.githubLink || settings.githubLink;
        settings.linkedinLink = req.body.linkedinLink || settings.linkedinLink;
        settings.lastUpdated = new Date();
      }

      await settings.save();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Error updating contact settings', error });
    }
  }
};