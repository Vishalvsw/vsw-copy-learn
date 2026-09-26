import React, { useState } from 'react';
import {
  ArrowLeft,
  Lock,
  Unlock,
  Sparkles,
  Eye,
  FileCode2,
  Cpu,
  Layers,
  Database,
  Terminal,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Bot
} from 'lucide-react';
import { CodeViewer } from './CodeViewer';
import { ProjectAiDrawer } from './ProjectAiDrawer';
import { ProjectDetail, User } from '../types';

interface ProjectDetailViewProps {
  project: ProjectDetail;
  user: User | null;
  onBack: () => void;
  onOpenPricing: () => void;
  onRequireAuth: () => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  user,
  onBack,
  onOpenPricing,
  onRequireAuth
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'architecture' | 'dataset' | 'deploy' | 'faq'>('code');
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

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

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Project Library</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Ask AI Trigger Button */}
          <button
            onClick={() => setAiDrawerOpen(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Ask AI Assistant</span>
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getBadgeStyle(project.accessLevel)}`}>
                {project.accessLevel === 'Free' ? 'Free Project' : `${project.accessLevel}+ Plan`}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {project.categoryName}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {project.difficulty}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {project.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              {project.shortDescription}
            </p>

            {/* Tech stack chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              {project.technologyStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-950 text-blue-300 border border-slate-800"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Quick stats panel */}
          <div className="lg:w-72 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl shrink-0 space-y-3 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Access Status:</span>
              <span className="font-bold flex items-center gap-1">
                {project.hasAccess ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Unlock className="w-3.5 h-3.5" />
                    Full Unlocked
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    Subscription Required
                  </span>
                )}
              </span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Code Modules:</span>
              <span className="text-white font-mono">{project.codeSections?.length || 'Restricted'} files</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Catalog Views:</span>
              <span className="text-white font-mono">{project.viewsCount}</span>
            </div>

            {!project.hasAccess && (
              <button
                onClick={onOpenPricing}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-1.5 text-xs"
              >
                <span>Unlock on {project.accessLevel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Problem Statement & Business Use Case summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              The Problem Statement
            </span>
            <p className="text-slate-200 leading-relaxed">{project.problemStatement}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
            <span className="font-bold text-blue-400 uppercase tracking-wider text-[10px]">
              Business Value & ROI
            </span>
            <p className="text-slate-200 leading-relaxed">{project.businessUseCase}</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 bg-slate-950 rounded-xl px-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('code')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'code'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          <span>Source Code & Files</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'architecture'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>System Architecture</span>
        </button>

        <button
          onClick={() => setActiveTab('dataset')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'dataset'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Dataset & Ingestion</span>
        </button>

        <button
          onClick={() => setActiveTab('deploy')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'deploy'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>How to Run & Deploy</span>
        </button>

        <button
          onClick={() => setActiveTab('faq')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'faq'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>FAQ & AI Context</span>
        </button>
      </div>

      {/* Tab 1: Source Code Viewer */}
      {activeTab === 'code' && (
        <div className="space-y-6">
          {project.hasAccess ? (
            <CodeViewer sections={project.codeSections} projectTitle={project.title} />
          ) : (
            /* Protected Upgrade Card - Enforced Server Side */
            <div className="rounded-2xl border-2 border-dashed border-blue-500/40 bg-slate-900/60 p-8 sm:p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white">Upgrade your plan to access this project</h3>
              <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                This project requires <strong className="text-white">{project.accessLevel}</strong> or higher.
                Unlock complete line-by-line source code, interactive code copy tools, production Docker configurations, and the AI engineering assistant.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onOpenPricing}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
                >
                  <span>View Upgrade Plans</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                {!user && (
                  <button
                    onClick={onRequireAuth}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl border border-slate-700 transition"
                  >
                    Sign In to Existing Account
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: System Architecture */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-blue-400">
              Pipeline Stages & Architectural Flow
            </h3>
            <p className="text-slate-300 leading-relaxed text-sm">{project.architecture.overview}</p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-blue-300">
              {project.architecture.diagramSummary}
            </div>

            <div className="space-y-3 pt-3">
              <h4 className="font-bold text-white text-xs">Sequential Engineering Steps:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.architecture.pipelineSteps.map((step, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-slate-200 font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {project.explanation && (
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-xs">Mathematical & Engineering Explanation:</h4>
                <p className="text-slate-300 leading-relaxed">{project.explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Dataset & Ingestion */}
      {activeTab === 'dataset' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-blue-400 mb-2">
              Dataset Specifications
            </h3>
            <p className="text-slate-300 leading-relaxed text-sm">{project.datasetInformation.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">Dataset Name</span>
              <p className="font-bold text-white">{project.datasetInformation.name}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">Source / Benchmark</span>
              <p className="font-bold text-white">{project.datasetInformation.source}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">Observation Volume</span>
              <p className="font-bold text-white">{project.datasetInformation.rows}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">Feature Schema</span>
              <p className="font-bold text-white">{project.datasetInformation.columns}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-slate-200">Data Fetching & Ingestion Instructions:</span>
            <p className="text-slate-400">{project.datasetInformation.downloadUrlOrInstructions}</p>
          </div>
        </div>
      )}

      {/* Tab 4: How To Run & Deploy */}
      {activeTab === 'deploy' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* How to Run */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>Local Execution Commands</span>
            </h3>
            <p className="text-slate-400">Step-by-step CLI commands to execute in your local terminal environment:</p>

            <div className="space-y-2">
              {project.howToRun.map((cmd, idx) => (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-200 flex items-center gap-2">
                  <span className="text-blue-500 select-none">$</span>
                  <span>{cmd}</span>
                </div>
              ))}
            </div>

            {project.output && (
              <div className="pt-3 border-t border-slate-800 space-y-1">
                <span className="font-bold text-slate-300">Expected Execution Output:</span>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-emerald-400">
                  {project.output}
                </div>
              </div>
            )}
          </div>

          {/* How to Deploy */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              <span>Cloud & Container Deployment</span>
            </h3>
            <p className="text-slate-400">Production deployment patterns for Docker, Kubernetes, AWS, or Cloud Run:</p>

            <div className="space-y-2">
              {project.howToDeploy.map((step, idx) => (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-200 flex items-center gap-2">
                  <span className="text-indigo-400 select-none">#</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: FAQ */}
      {activeTab === 'faq' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-blue-400">
            Technical Architecture FAQ
          </h3>
          <div className="space-y-3">
            {project.faq.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-white text-sm">{item.question}</h4>
                <p className="text-slate-300 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Assistant Drawer */}
      <ProjectAiDrawer
        projectId={project.id}
        projectTitle={project.title}
        user={user}
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        onRequireAuth={onRequireAuth}
        onRequireUpgrade={onOpenPricing}
      />
    </div>
  );
};
