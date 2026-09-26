import React from 'react';
import { Lock, Unlock, Eye, FileCode2, ArrowRight } from 'lucide-react';
import { ProjectSummary } from '../types';

interface ProjectCardProps {
  project: ProjectSummary;
  onOpen: (slugOrId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpen }) => {
  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'Free':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Starter':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Professional':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Premium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'text-emerald-400';
      case 'Intermediate':
        return 'text-blue-400';
      case 'Advanced':
        return 'text-purple-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div
      onClick={() => onOpen(project.slug || project.id)}
      className="group bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-blue-950/40 cursor-pointer"
    >
      <div>
        {/* Thumbnail Header */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-950">
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-95"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-md shadow ${getBadgeStyle(
                project.accessLevel
              )}`}
            >
              {project.accessLevel === 'Free' ? 'Free Project' : `${project.accessLevel}+ Access`}
            </span>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-md text-[11px] text-slate-300 border border-slate-800">
              {project.hasAccess ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <Unlock className="w-3 h-3" />
                  Unlocked
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400">
                  <Lock className="w-3 h-3" />
                  Locked
                </span>
              )}
            </div>
          </div>

          {/* Category overlay */}
          <div className="absolute bottom-3 left-3">
            <span className="text-xs font-semibold text-blue-300 bg-blue-950/80 px-2.5 py-0.5 rounded-md border border-blue-800/40">
              {project.categoryName}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className={`font-semibold ${getDifficultyColor(project.difficulty)}`}>
              {project.difficulty} Level
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
                {project.codeSectionsCount} Files
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {project.viewsCount}
              </span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition line-clamp-2 mb-2">
            {project.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
            {project.shortDescription}
          </p>

          {/* Tech Stack Chips */}
          <div className="flex flex-wrap gap-1.5">
            {project.technologyStack.slice(0, 4).map((tech, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
              >
                {tech}
              </span>
            ))}
            {project.technologyStack.length > 4 && (
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400">
                +{project.technologyStack.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/50 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition">
          {project.hasAccess ? 'Open Source & Docs' : 'Preview & Unlock'}
        </span>
        <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-blue-600 group-hover:text-white text-slate-400 flex items-center justify-center transition">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
