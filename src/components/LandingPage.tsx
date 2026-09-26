import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Code2,
  Copy,
  Layers,
  Cpu,
  Bot,
  Shield,
  Zap,
  CheckCircle2,
  FolderTree,
  FileCode2,
  Terminal,
  HelpCircle,
  TrendingUp,
  Brain
} from 'lucide-react';
import { DynamicPricing } from './DynamicPricing';
import { ProjectCard } from './ProjectCard';
import { HomepageCMS, Plan, ProjectSummary, Category } from '../types';

interface LandingPageProps {
  homepage: HomepageCMS;
  plans: Plan[];
  featuredProjects: ProjectSummary[];
  categories: Category[];
  onExploreProjects: () => void;
  onOpenPricing: () => void;
  onOpenProject: (slug: string) => void;
  onSelectPlan: (plan: Plan) => void;
  currentUserPlan?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  homepage,
  plans,
  featuredProjects,
  categories,
  onExploreProjects,
  onOpenPricing,
  onOpenProject,
  onSelectPlan,
  currentUserPlan
}) => {
  return (
    <div className="space-y-24">
      {/* 1. Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Stats Ribbon Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-blue-800/40 text-blue-300 text-xs font-semibold shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{homepage.hero.statsBadge}</span>
        </div>

        {/* Brand & Main Tagline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <p className="text-xs sm:text-sm font-extrabold tracking-widest text-slate-400 uppercase">
            {homepage.hero.brandTagline}
          </p>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            {homepage.hero.title}
          </h1>
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed pt-2">
            {homepage.hero.subtitle}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onExploreProjects}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2 text-sm sm:text-base group"
          >
            <span>{homepage.hero.primaryCtaText}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenPricing}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-extrabold rounded-xl border border-slate-800 shadow-sm transition text-sm sm:text-base"
          >
            {homepage.hero.secondaryCtaText}
          </button>
        </div>

        {/* Core Product Workflow Visual */}
        <div className="pt-8">
          <div className="max-w-4xl mx-auto p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-mono">
            <span className="text-slate-400">LOGIN</span>
            <span className="text-blue-500">→</span>
            <span className="text-slate-400">SELECT PLAN</span>
            <span className="text-blue-500">→</span>
            <span className="text-slate-300">GET ACCESS</span>
            <span className="text-blue-500">→</span>
            <span className="text-slate-200">BROWSE PROJECTS</span>
            <span className="text-blue-500">→</span>
            <span className="text-blue-400 font-bold">VIEW CODE</span>
            <span className="text-blue-500">→</span>
            <span className="text-emerald-400 font-bold">COPY CODE</span>
            <span className="text-blue-500">→</span>
            <span className="text-amber-400 font-bold">LEARN / BUILD</span>
          </div>
        </div>
      </section>

      {/* 2. What is VSW ML HUB? */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            Built for Practitioners
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {homepage.whatIsVsw.heading}
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            {homepage.whatIsVsw.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {homepage.whatIsVsw.points.map((pt, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                {idx === 0 && <Code2 className="w-5 h-5" />}
                {idx === 1 && <Copy className="w-5 h-5" />}
                {idx === 2 && <Layers className="w-5 h-5" />}
                {idx === 3 && <Bot className="w-5 h-5" />}
              </div>
              <h3 className="text-base font-bold text-white">{pt.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{pt.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. How It Works (4 Steps) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            How VSW ML HUB Works
          </h2>
          <p className="text-sm text-slate-400">
            From project discovery to cloud deployment in four streamlined steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[homepage.howItWorks.step1, homepage.howItWorks.step2, homepage.howItWorks.step3, homepage.howItWorks.step4].map(
            (step, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                  {idx + 1}
                </div>
                <h3 className="text-sm font-bold text-white">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            )
          )}
        </div>
      </section>

      {/* 4. Featured Projects Carousel / Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              Production Spotlights
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Featured Machine Learning Projects
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Tested end-to-end architectures ready for immediate review and implementation.
            </p>
          </div>

          <button
            onClick={onExploreProjects}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 group shrink-0"
          >
            <span>View All Projects in Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProjects.map((p) => (
            <ProjectCard key={p.id} project={p} onOpen={onOpenProject} />
          ))}
        </div>
      </section>

      {/* 5. Project Categories Explorer */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Explore by ML Specialization
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            From classical regression to deep generative AI architectures.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((c) => (
            <div
              key={c.id}
              onClick={onExploreProjects}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 cursor-pointer transition text-center space-y-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto group-hover:bg-blue-600 group-hover:text-white transition">
                <Brain className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition truncate">
                {c.name}
              </h3>
              <p className="text-[11px] text-slate-400">{c.projectCount || 0} projects</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Dynamic Pricing Component */}
      <DynamicPricing
        plans={plans}
        onSelectPlan={onSelectPlan}
        currentUserPlan={currentUserPlan}
      />

      {/* 7. Why VSW ML HUB? */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 p-8 sm:p-12 space-y-8">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-black text-white tracking-tight">
              Why Engineers Choose VSW ML HUB
            </h2>
            <p className="text-sm text-slate-300">
              Unlike generic tutorials or outdated notebooks, VSW ML HUB projects are architected for real-world reliability and speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="space-y-2">
              <span className="font-bold text-blue-400 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                No Code Downloading Clutter
              </span>
              <p className="text-slate-400 leading-relaxed">
                Access clean, modular code directly inside your browser. Search line numbers, copy specific functions, and avoid messy local zip files.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Project-Grounded AI Assistant
              </span>
              <p className="text-slate-400 leading-relaxed">
                Interact with an intelligent assistant with total contextual knowledge of the project's code, Dockerfiles, and math formulas.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Continuous Library Expansions
              </span>
              <p className="text-slate-400 leading-relaxed">
                New ML and Generative AI projects are added bi-weekly, keeping your technical toolbelt ahead of industry shifts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Loved by Developers & Data Scientists
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real feedback from engineers building commercial systems with VSW ML HUB.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {homepage.testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-9 h-9 rounded-full object-cover bg-slate-950"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">{t.name}</h4>
                  <p className="text-[11px] text-slate-400">{t.role}, {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. FAQ Accordion */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Everything you need to know about access, pricing, and project licenses.
          </p>
        </div>

        <div className="space-y-3">
          {homepage.faq.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2"
            >
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{item.question}</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed pl-6">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Bottom CTA Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-8 sm:p-14 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Build Production ML Systems?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
            Get instant online access to 40+ complete machine learning projects with tested source code, deployment scripts, and AI assistance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenPricing}
              className="px-8 py-3.5 bg-white text-blue-950 font-black text-sm rounded-xl hover:bg-slate-100 transition shadow-lg"
            >
              Choose Your Access Plan
            </button>
            <button
              onClick={onExploreProjects}
              className="px-8 py-3.5 bg-blue-950/50 hover:bg-blue-950/70 text-white font-bold text-sm rounded-xl border border-blue-400/30 transition"
            >
              Explore Free Projects First
            </button>
          </div>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <p className="font-extrabold text-white text-sm">{homepage.footer.companyName}</p>
            <p className="text-[11px] text-slate-400 font-semibold tracking-wider">
              {homepage.footer.tagline}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">{homepage.footer.disclaimer}</p>
          </div>

          <div className="flex items-center gap-6">
            <a
              href={`mailto:${homepage.footer.contactEmail}`}
              className="text-blue-400 hover:underline"
            >
              {homepage.footer.contactEmail}
            </a>
            <span>© {homepage.footer.copyrightYear} VSW ML HUB</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
