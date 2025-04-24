import { Request, Response } from 'express';
import { Settings } from '../models/Settings';

export const settingsController = {
  // Get settings
  getSettings: async (req: Request, res: Response) => {
    try {
      let settings = await Settings.findOne();
      
      // If no settings exist, create default settings
      if (!settings) {
        settings = await Settings.create({});
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching settings', error });
    }
  },

  // Update settings
  updateSettings: async (req: Request, res: Response) => {
    try {
      let settings = await Settings.findOne();
      
      // If no settings exist, create new settings
      if (!settings) {
        settings = new Settings(req.body);
      } else {
        // Update existing settings with new values while keeping defaults
        const { homePage, contactPage, visibility, socialLinks } = req.body;
        
        if (homePage) {
          settings.homePage = { ...settings.homePage, ...homePage };
        }
        if (contactPage) {
          settings.contactPage = { ...settings.contactPage, ...contactPage };
        }
        if (visibility) {
          settings.visibility = { ...settings.visibility, ...visibility };
        }
        if (socialLinks) {
          settings.socialLinks = { ...settings.socialLinks, ...socialLinks };
        }
      }

      await settings.save();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Error updating settings', error });
    }
  }
};