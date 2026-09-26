import React, { useState } from 'react';
import { Search, Filter, Sparkles, FolderTree, Code2, AlertCircle } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { ProjectSummary, Category } from '../types';

interface ProjectCatalogProps {
  projects: ProjectSummary[];
  categories: Category[];
  onOpenProject: (slug: string) => void;
  onOpenPricing: () => void;
}

export const ProjectCatalog: React.FC<ProjectCatalogProps> = ({
  projects,
  categories,
  onOpenProject,
  onOpenPricing
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedAccess, setSelectedAccess] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const filtered = projects.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
      p.technologyStack.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchCat = selectedCat === 'all' || p.categoryId === selectedCat;
    const matchAccess = selectedAccess === 'all' || p.accessLevel === selectedAccess;
    const matchDiff = selectedDifficulty === 'all' || p.difficulty === selectedDifficulty;

    return matchSearch && matchCat && matchAccess && matchDiff;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'popular') return b.viewsCount - a.viewsCount;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
  });

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Catalog Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-400 text-xs font-semibold uppercase tracking-wider">
          <Code2 className="w-3.5 h-3.5 text-blue-400" />
          Production Engineering Catalog
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Machine Learning Project Repository
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Inspect production-ready pipelines, understand end-to-end architectures, copy tested code, and deploy to your cloud.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        {/* Search input + sort */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by model, domain, or technology (e.g. RoBERTa, XGBoost, YOLO, PyTorch)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <select
              value={selectedAccess}
              onChange={(e) => setSelectedAccess(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-blue-500 font-semibold text-blue-300"
            >
              <option value="all">All Access Tiers</option>
              <option value="Free">Free Tier Projects</option>
              <option value="Starter">Starter Access</option>
              <option value="Professional">Professional Access</option>
              <option value="Premium">Premium Access</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              selectedCat === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Categories ({projects.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                selectedCat === c.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Projects Count Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Showing {sorted.length} machine learning projects</span>
        {selectedAccess !== 'all' && (
          <button
            onClick={() => setSelectedAccess('all')}
            className="text-blue-400 hover:underline"
          >
            Clear Tier Filter
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {sorted.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-slate-800 bg-slate-900/60 p-8 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No matching projects found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try broadening your search keywords or resetting the category and tier filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCat('all');
              setSelectedAccess('all');
              setSelectedDifficulty('all');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onOpen={onOpenProject}
            />
          ))}
        </div>
      )}
    </div>
  );
};
