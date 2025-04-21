import { Request, Response } from 'express';
import { Project } from '../models/Project';

export const projectController = {
  // Get all projects
  getAllProjects: async (req: Request, res: Response) => {
    try {
      const projects = await Project.find().sort({ startDate: -1 });
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching projects', error });
    }
  },

  // Get current projects
    getCurrentProjects: async (req: Request, res: Response) => {
    try {
      const projects = await Project.find({ isCurrentProject: true });
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching current projects', error });
    }
  },

  // Create new project
  createProject: async (req: Request, res: Response) => {
    try {
      const project = new Project(req.body);
      await project.save();
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: 'Error creating project', error });
    }
  },

  // Update project
  updateProject: async (req: Request, res: Response) => {
    try {
      const project = await Project.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: 'Error updating project', error });
    }
  },

  // Delete project
  deleteProject: async (req: Request, res: Response) => {
    try {
      const project = await Project.findByIdAndDelete(req.params.id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting project', error });
    }
  }
};