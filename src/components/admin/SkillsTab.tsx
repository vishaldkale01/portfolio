import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../Button';
import { useTheme } from '../../context/ThemeContext';
import { useSkills } from '../../hooks/useSkills';
import { Skill } from '../../types';

export function SkillsTab() {
  const { theme } = useTheme();
  const {
    skills,
    categories,
    submitLoading,
    createSkill,
    updateSkill,
    deleteSkill,
    addCategory
  } = useSkills();

  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    name: '',
    category: '',
    proficiency: 0
  });

  const [editingSkill, setEditingSkill] = useState<Partial<Skill> | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createSkill(newSkill);
    if (success) {
      setNewSkill({ name: '', category: '', proficiency: 0 });
    }
  };

  const handleEditSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill?._id) return;
    const success = await updateSkill(editingSkill._id, editingSkill);
    if (success) {
      setEditingSkill(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    await deleteSkill(id);
  };

  const handleAddCategory = () => {
    addCategory(newCategoryName);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  return (
    <div className="space-y-8">
      {/* Add/Edit Skill Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white/50'} p-6 rounded-lg border border-blue-500/30`}
      >
        <h2 className="text-xl font-bold text-blue-400 mb-6">
          {editingSkill ? 'Edit Skill' : 'Add New Skill'}
        </h2>
        
        <form onSubmit={editingSkill ? handleEditSkill : handleCreateSkill} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Name
              </label>
              <input
                type="text"
                value={editingSkill?.name || newSkill.name}
                onChange={e => editingSkill 
                  ? setEditingSkill({...editingSkill, name: e.target.value})
                  : setNewSkill({...newSkill, name: e.target.value})}
                className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Category
              </label>
              {isAddingCategory ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    className={`flex-1 p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                    placeholder="Enter new category"
                    autoFocus
                  />
                  <Button onClick={handleAddCategory}>Add</Button>
                  <Button variant="secondary" onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName('');
                  }}>Cancel</Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={editingSkill?.category || newSkill.category}
                    onChange={e => editingSkill
                      ? setEditingSkill({...editingSkill, category: e.target.value})
                      : setNewSkill({...newSkill, category: e.target.value})}
                    className={`flex-1 p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <Button variant="secondary" onClick={() => setIsAddingCategory(true)}>New</Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Proficiency
              </label>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                {editingSkill?.proficiency || newSkill.proficiency}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={editingSkill?.proficiency || newSkill.proficiency}
              onChange={e => {
                const value = parseInt(e.target.value);
                editingSkill
                  ? setEditingSkill({...editingSkill, proficiency: value})
                  : setNewSkill({...newSkill, proficiency: value});
              }}
              className="w-full h-2 bg-gray-700/50 rounded-full appearance-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-blue-400 active:[&::-webkit-slider-thumb]:scale-110 transition-all duration-100"
              style={{
                background: `linear-gradient(to right, #3b82f6 ${editingSkill?.proficiency || newSkill.proficiency}%, rgba(55, 65, 81, 0.5) ${editingSkill?.proficiency || newSkill.proficiency}%)`
              }}
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              isLoading={submitLoading}
              loadingText={editingSkill ? "Updating..." : "Adding..."}
            >
              {editingSkill ? 'Update Skill' : 'Add Skill'}
            </Button>
            {editingSkill && (
              <Button
                variant="secondary"
                onClick={() => setEditingSkill(null)}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </motion.div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => (
          <motion.div
            key={skill._id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`relative group ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white/50'} p-6 rounded-lg border border-blue-500/30 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} text-lg`}>
                    {skill.name}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    {skill.category}
                  </p>
                </div>
                <span className={`text-lg ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} font-semibold`}>
                  {skill.proficiency}%
                </span>
              </div>

              <div className="mt-4">
                <div className="relative h-2 bg-gray-700/20 rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300"
                    style={{ width: `${skill.proficiency}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  onClick={() => setEditingSkill(skill)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(skill._id!)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
