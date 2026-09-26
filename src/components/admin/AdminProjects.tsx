import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  FileCode2,
  Lock,
  Unlock,
  Check,
  X,
  Loader2,
  Layers,
  Search,
  ExternalLink
} from 'lucide-react';
import { api } from '../../api';
import { ProjectDetail, Category, CodeSection } from '../../types';

interface AdminProjectsProps {
  projects: ProjectDetail[];
  categories: Category[];
  onRefresh: () => void;
  onOpenPublicProject: (slug: string) => void;
}

export const AdminProjects: React.FC<AdminProjectsProps> = ({
  projects,
  categories,
  onRefresh,
  onOpenPublicProject
}) => {
  const [editingProject, setEditingProject] = useState<Partial<ProjectDetail> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Multi-file code editor state
  const [codeSections, setCodeSections] = useState<CodeSection[]>([]);
  const [activeCodeTab, setActiveCodeTab] = useState(0);

  const handleOpenCreate = () => {
    const initialSections: CodeSection[] = [
      {
        title: 'Core Model Definition',
        filename: 'model.py',
        language: 'python',
        description: 'PyTorch/Scikit-learn model architecture and pipeline',
        code: `# VSW ML HUB - Production Model\nimport torch\nimport torch.nn as nn\n\nclass CustomPredictor(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc = nn.Linear(32, 2)\n\n    def forward(self, x):\n        return self.fc(x)\n`
      }
    ];

    setEditingProject({
      title: '',
      slug: '',
      shortDescription: '',
      fullDescription: '',
      categoryId: categories[0]?.id || 'cat_ml',
      difficulty: 'Intermediate',
      technologyStack: ['Python', 'PyTorch', 'FastAPI'],
      problemStatement: '',
      businessUseCase: '',
      datasetInformation: {
        name: 'Curated Benchmark Dataset',
        source: 'Kaggle / OpenML',
        rows: '25,000 samples',
        columns: 'feature_1 to feature_n, target',
        description: 'Cleaned and normalized for immediate model training.',
        downloadUrlOrInstructions: 'Download via script in data/ directory.'
      },
      architecture: {
        overview: 'Microservice design with asynchronous inference endpoints.',
        pipelineSteps: ['Data Ingestion', 'Feature Normalization', 'Model Inference', 'Confidence Calibration'],
        diagramSummary: 'Client -> FastAPI Service -> Inference Engine -> Response Payload'
      },
      codeSections: initialSections,
      explanation: 'Step-by-step mathematical and architectural rationale.',
      output: '95% F1-score with sub-15ms latency.',
      howToRun: ['pip install -r requirements.txt', 'python main.py'],
      howToDeploy: ['docker build -t ml-app .', 'docker run -p 8000:8000 ml-app'],
      faq: [{ question: 'How is batching handled?', answer: 'Supports mini-batch vectorization.' }],
      aiPromptContext: '',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
      accessLevel: 'Professional',
      status: 'Published'
    });

    setCodeSections(initialSections);
    setActiveCodeTab(0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: ProjectDetail) => {
    setEditingProject({ ...project });
    setCodeSections(project.codeSections || []);
    setActiveCodeTab(0);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editingProject.title) return;

    setLoading(true);
    const payload = {
      ...editingProject,
      codeSections
    };

    try {
      if (editingProject.id) {
        await api.updateProject(editingProject.id, payload);
      } else {
        await api.createProject(payload);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete project: "${title}"?`)) return;
    try {
      await api.deleteProject(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    }
  };

  const handleAddCodeFile = () => {
    const newFile: CodeSection = {
      title: 'New Service Module',
      filename: `service_${codeSections.length + 1}.py`,
      language: 'python',
      description: 'Module execution instructions',
      code: '# Add source code here\n'
    };
    setCodeSections([...codeSections, newFile]);
    setActiveCodeTab(codeSections.length);
  };

  const handleRemoveCodeFile = (idx: number) => {
    if (codeSections.length <= 1) {
      alert('Project must have at least one code file.');
      return;
    }
    const updated = codeSections.filter((_, i) => i !== idx);
    setCodeSections(updated);
    setActiveCodeTab(Math.max(0, idx - 1));
  };

  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === 'all' || p.categoryId === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Project Library Manager</h2>
          <p className="text-xs text-slate-400">
            Publish and curate machine learning projects, multi-file codebases, datasets, and access tiers.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title or stack..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full sm:w-56 px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Projects Table */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Project</th>
                <th className="p-4">Category</th>
                <th className="p-4">Difficulty</th>
                <th className="p-4">Access Level</th>
                <th className="p-4">Files</th>
                <th className="p-4">Views</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.thumbnail}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-slate-950 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-white line-clamp-1">{p.title}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{p.shortDescription}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300 font-medium">{p.categoryName}</td>
                  <td className="p-4">
                    <span className="font-semibold text-slate-300">{p.difficulty}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                        p.accessLevel === 'Free'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : p.accessLevel === 'Starter'
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                          : p.accessLevel === 'Professional'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {p.accessLevel}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{p.codeSections?.length || 0}</td>
                  <td className="p-4 text-slate-400">{p.viewsCount || 0}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        p.status === 'Published'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-slate-400 bg-slate-800'
                      }`}
                    >
                      {p.status || 'Published'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenPublicProject(p.slug || p.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 transition"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Project Modal */}
      {isModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-white">
                {editingProject.id ? `Edit: ${editingProject.title}` : 'Add New Machine Learning Project'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Primary Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    value={editingProject.title || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    placeholder="e.g. End-to-End Customer Churn Prediction"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Access Level</label>
                  <select
                    value={editingProject.accessLevel || 'Professional'}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, accessLevel: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="Free">Free (Public Open Access)</option>
                    <option value="Starter">Starter (Starter+)</option>
                    <option value="Professional">Professional (Professional+)</option>
                    <option value="Premium">Premium Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={editingProject.categoryId || categories[0]?.id}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, categoryId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Difficulty</label>
                  <select
                    value={editingProject.difficulty || 'Intermediate'}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, difficulty: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Publish Status</label>
                  <select
                    value={editingProject.status || 'Published'}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Published">Published (Live)</option>
                    <option value="Draft">Draft (Internal)</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Short Summary</label>
                <textarea
                  rows={2}
                  value={editingProject.shortDescription || ''}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, shortDescription: e.target.value })
                  }
                  placeholder="Concise overview for catalog cards..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Problem Statement</label>
                  <textarea
                    rows={3}
                    value={editingProject.problemStatement || ''}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, problemStatement: e.target.value })
                    }
                    placeholder="Real-world engineering challenge..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Business Use Case & ROI</label>
                  <textarea
                    rows={3}
                    value={editingProject.businessUseCase || ''}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, businessUseCase: e.target.value })
                    }
                    placeholder="Commercial value and enterprise applications..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Multi-File Codebase Editor */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-sm text-white">Source Code Files & Modules</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCodeFile}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add File
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {codeSections.map((sec, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveCodeTab(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap ${
                        activeCodeTab === idx
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <span>{sec.filename}</span>
                      {codeSections.length > 1 && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCodeFile(idx);
                          }}
                          className="hover:text-rose-300"
                        >
                          ×
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Active File Editor */}
                {codeSections[activeCodeTab] && (
                  <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-0.5">Filename</label>
                        <input
                          type="text"
                          value={codeSections[activeCodeTab].filename}
                          onChange={(e) => {
                            const updated = [...codeSections];
                            updated[activeCodeTab].filename = e.target.value;
                            setCodeSections(updated);
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-0.5">Module Label</label>
                        <input
                          type="text"
                          value={codeSections[activeCodeTab].title}
                          onChange={(e) => {
                            const updated = [...codeSections];
                            updated[activeCodeTab].title = e.target.value;
                            setCodeSections(updated);
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-0.5">Language</label>
                        <input
                          type="text"
                          value={codeSections[activeCodeTab].language}
                          onChange={(e) => {
                            const updated = [...codeSections];
                            updated[activeCodeTab].language = e.target.value;
                            setCodeSections(updated);
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-0.5">Source Code Content</label>
                      <textarea
                        rows={10}
                        value={codeSections[activeCodeTab].code}
                        onChange={(e) => {
                          const updated = [...codeSections];
                          updated[activeCodeTab].code = e.target.value;
                          setCodeSections(updated);
                        }}
                        className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs leading-relaxed focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Architecture & Run Commands */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Architecture Overview</label>
                  <textarea
                    rows={3}
                    value={editingProject.architecture?.overview || ''}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        architecture: {
                          ...editingProject.architecture!,
                          overview: e.target.value
                        }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Thumbnail URL</label>
                  <input
                    type="url"
                    value={editingProject.thumbnail || ''}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, thumbnail: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Project to Library</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
