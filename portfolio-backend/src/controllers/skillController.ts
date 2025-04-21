import { Request, Response } from 'express';
import { Skill } from '../models/Skill';

export const skillController = {
  // Get all skills
  getAllSkills: async (req: Request, res: Response) => {
    try {
      const skills = await Skill.find().sort({ category: 1, name: 1 });
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching skills', error });
    }
  },

  // Get skills by category
  getSkillsByCategory: async (req: Request, res: Response) => {
    try {
      const skills = await Skill.find({ category: req.params.category });
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching skills by category', error });
    }
  },

  // Create new skill
  createSkill: async (req: Request, res: Response) => {
    try {
      const skill = new Skill(req.body);
      await skill.save();
      res.status(201).json(skill);
    } catch (error) {
      res.status(400).json({ message: 'Error creating skill', error });
    }
  },

  // Update skill
  updateSkill: async (req: Request, res: Response) => {
    try {
      const skill = await Skill.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!skill) {
        return res.status(404).json({ message: 'Skill not found' });
      }
      res.json(skill);
    } catch (error) {
      res.status(400).json({ message: 'Error updating skill', error });
    }
  },

  // Delete skill
  deleteSkill: async (req: Request, res: Response) => {
    try {
      const skill = await Skill.findByIdAndDelete(req.params.id);
      if (!skill) {
        return res.status(404).json({ message: 'Skill not found' });
      }
      res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting skill', error });
    }
  }
};