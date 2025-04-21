import { Request, Response } from 'express';
import { Experience } from '../models/Experience';

export const experienceController = {
  // Get all experiences
  getAllExperiences: async (req: Request, res: Response) => {
    try {
      const experiences = await Experience.find().sort({ startDate: -1 });
      res.json(experiences);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching experiences', error });
    }
  },

  // Get current experience
  getCurrentExperience: async (req: Request, res: Response) => {
    try {
      const experience = await Experience.findOne({ isCurrentRole: true });
      res.json(experience);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching current experience', error });
    }
  },

  // Create new experience
  createExperience: async (req: Request, res: Response) => {
    try {
      const experience = new Experience(req.body);
      await experience.save();
      res.status(201).json(experience);
    } catch (error) {
      res.status(400).json({ message: 'Error creating experience', error });
    }
  },

  // Update experience
  updateExperience: async (req: Request, res: Response) => {
    try {
      const experience = await Experience.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!experience) {
        return res.status(404).json({ message: 'Experience not found' });
      }
      res.json(experience);
    } catch (error) {
      res.status(400).json({ message: 'Error updating experience', error });
    }
  },

  // Delete experience
  deleteExperience: async (req: Request, res: Response) => {
    try {
      const experience = await Experience.findByIdAndDelete(req.params.id);
      if (!experience) {
        return res.status(404).json({ message: 'Experience not found' });
      }
      res.json({ message: 'Experience deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting experience', error });
    }
  }
};