import { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { motion } from 'framer-motion';
import { learningApi, Phase } from '../../utils/learningApi';

interface PhaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (addTasksImmediately?: boolean, phaseId?: string) => void;
  planId: string;
  phase?: Phase;
  maxOrder: number;
}

export default function PhaseFormModal({ isOpen, onClose, onSuccess, planId, phase, maxOrder }: PhaseFormModalProps) {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    order: number;
    status: 'not-started' | 'in-progress' | 'completed';
    planId: string;
  }>({
    title: '',
    description: '',
    order: maxOrder + 1,
    status: 'not-started',
    planId,
  });
  const [addTasksImmediately, setAddTasksImmediately] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class:
          'min-h-[150px] p-3 text-sm text-white focus:outline-none prose prose-invert max-w-none [&_p]:my-1 [&_ul]:my-2 [&_ol]:my-2',
      },
    },
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({ ...prev, description: editor.getHTML() }));
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    const description = phase?.description || '';
    setFormData({
      title: phase?.title || '',
      description,
      order: phase?.order || maxOrder + 1,
      status: phase?.status || 'not-started',
      planId,
    });
    editor?.commands.setContent(description || '');
    setAddTasksImmediately(false);
    setError(null);
  }, [isOpen, phase, planId, maxOrder, editor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const phaseData = {
      title: formData.title,
      description: formData.description,
      order: formData.order,
      status: formData.status,
      planId: formData.planId,
    };

    try {
      const response = phase
        ? await learningApi.updatePhase(phase._id, phaseData)
        : await learningApi.createPhase(phaseData);

      if ('error' in response) {
        setError(response.error);
      } else {
        const phaseId = 'data' in response ? response.data?._id : phase?._id;
        onSuccess(addTasksImmediately, phaseId);
        onClose();
      }
    } catch (err) {
      console.error('Phase save error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{phase ? 'Edit Phase' : 'Add New Phase'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Week 1-2: React Fundamentals"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                  <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-700 bg-gray-900/40">
                    <ToolbarButton label="Bold" onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')}>
                      B
                    </ToolbarButton>
                    <ToolbarButton label="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')}>
                      I
                    </ToolbarButton>
                    <ToolbarButton
                      label="Heading"
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                      active={editor?.isActive('heading', { level: 3 })}
                    >
                      H3
                    </ToolbarButton>
                    <ToolbarButton
                      label="Bullet list"
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      active={editor?.isActive('bulletList')}
                    >
                      • List
                    </ToolbarButton>
                    <ToolbarButton label="Undo" onClick={() => editor?.chain().focus().undo().run()}>
                      Undo
                    </ToolbarButton>
                    <ToolbarButton label="Redo" onClick={() => editor?.chain().focus().redo().run()}>
                      Redo
                    </ToolbarButton>
                  </div>
                  <EditorContent editor={editor} />
                </div>
                <p className="text-xs text-gray-500 mt-2">Use formatting for client-ready phase documentation.</p>
              </div>
            </div>

            <aside className="space-y-4 lg:pl-2">
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4 space-y-4">
                <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Settings</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Order</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'not-started' | 'in-progress' | 'completed' })}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                {!phase && (
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="addTasksImmediately"
                      checked={addTasksImmediately}
                      onChange={(e) => setAddTasksImmediately(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500/20"
                    />
                    <label htmlFor="addTasksImmediately" className="text-sm text-gray-300 cursor-pointer select-none leading-snug">
                      Add tasks after creating
                    </label>
                  </div>
                )}
              </div>
            </aside>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all shadow-md">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20"
            >
              {loading ? 'Saving...' : phase ? 'Update Phase' : 'Create Phase'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

interface ToolbarButtonProps {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: string;
}

function ToolbarButton({ label, onClick, active = false, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`px-2 py-1 text-xs rounded border transition-colors ${
        active ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700/70'
      }`}
    >
      {children}
    </button>
  );
}
