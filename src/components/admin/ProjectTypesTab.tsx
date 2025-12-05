import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../Button';
import { useTheme } from '../../context/ThemeContext';
import { useProjectTypes, ProjectType } from '../../hooks/useProjectTypes';

export function ProjectTypesTab() {
  const { theme } = useTheme();
  const {
    projectTypes,
    addProjectType,
    editProjectType,
    deleteProjectType
  } = useProjectTypes();

  const [newProjectType, setNewProjectType] = useState('');
  const [editingProjectType, setEditingProjectType] = useState<{ oldType: ProjectType; newType: string } | null>(null);

  const handleAddProjectType = () => {
    if (addProjectType(newProjectType)) {
      setNewProjectType('');
    }
  };

  const handleEditProjectType = () => {
    if (editingProjectType) {
      if (editProjectType(editingProjectType.oldType, editingProjectType.newType)) {
        setEditingProjectType(null);
      }
    }
  };

  const handleDeleteProjectType = (typeToDelete: ProjectType) => {
    if (window.confirm(`Are you sure you want to delete project type "${typeToDelete}"?`)) {
      deleteProjectType(typeToDelete);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white/50'} p-6 rounded-lg border border-blue-500/30`}
    >
      <h2 className="text-xl font-bold text-blue-400 mb-6">Manage Project Types</h2>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={newProjectType}
          onChange={(e) => setNewProjectType(e.target.value)}
          placeholder="New project type"
          className={`flex-1 p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
        />
        <Button onClick={handleAddProjectType}>
          Add Type
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projectTypes.map((type) => (
          <div
            key={type}
            className={`relative group ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white/50'} p-4 rounded-lg border border-blue-500/30 hover:border-blue-400 transition-all duration-300`}
          >
            {editingProjectType?.oldType === type ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingProjectType.newType}
                  onChange={(e) => setEditingProjectType({ 
                    oldType: type, 
                    newType: e.target.value 
                  })}
                  className={`flex-1 p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                />
                <Button onClick={handleEditProjectType}>Save</Button>
                <Button variant="secondary" onClick={() => setEditingProjectType(null)}>Cancel</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{type}</span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" onClick={() => setEditingProjectType({ oldType: type, newType: type })}>Edit</Button>
                  <Button variant="danger" onClick={() => handleDeleteProjectType(type)}>Delete</Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
