import React, { useState, useMemo } from 'react';
import { Copy, Check, Search, FileCode2, Terminal, Code2 } from 'lucide-react';
import { CodeSection } from '../types';

interface CodeViewerProps {
  sections: CodeSection[];
  projectTitle: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ sections, projectTitle }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [copiedFile, setCopiedFile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentSection = sections[activeTab] || sections[0];

  const handleCopyCode = async (codeToCopy: string) => {
    try {
      await navigator.clipboard.writeText(codeToCopy);
      setCopiedFile(true);
      setTimeout(() => setCopiedFile(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const lines = useMemo(() => {
    if (!currentSection || !currentSection.code) return [];
    return currentSection.code.split('\n');
  }, [currentSection]);

  const matchingLineIndices = useMemo(() => {
    if (!searchQuery.trim() || !lines.length) return new Set<number>();
    const q = searchQuery.toLowerCase();
    const set = new Set<number>();
    lines.forEach((line, idx) => {
      if (line.toLowerCase().includes(q)) {
        set.add(idx);
      }
    });
    return set;
  }, [searchQuery, lines]);

  if (!sections || sections.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
        <Code2 className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">No source code files available for this project.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
      {/* Top File Selector Tabs & Search Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-2 sm:px-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* File Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {sections.map((section, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveTab(idx);
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === idx
                  ? 'bg-slate-800 text-blue-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileCode2 className={`w-3.5 h-3.5 ${activeTab === idx ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{section.filename}</span>
            </button>
          ))}
        </div>

        {/* Search within Code & Language badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code..."
              className="w-36 sm:w-48 pl-8 pr-2.5 py-1 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                {matchingLineIndices.size} found
              </span>
            )}
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800/50">
            {currentSection.language || 'Python'}
          </span>
        </div>
      </div>

      {/* File Description Header & Copy Button */}
      <div className="px-4 py-2.5 bg-slate-900/50 border-b border-slate-800/70 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-slate-300">{currentSection.title}</span>
          <span className="hidden sm:inline text-slate-400">— {currentSection.description}</span>
        </div>

        {/* Copy Code Action Button */}
        <button
          onClick={() => handleCopyCode(currentSection.code)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
            copiedFile
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
          title="Copy this source code to clipboard"
        >
          {copiedFile ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Container with Line Numbers */}
      <div className="relative font-mono text-xs overflow-x-auto max-h-[580px] p-4 bg-slate-950">
        <div className="min-w-full inline-block">
          {lines.map((line, idx) => {
            const lineNum = idx + 1;
            const isMatch = matchingLineIndices.has(idx);

            return (
              <div
                key={idx}
                className={`flex items-baseline leading-6 hover:bg-slate-900/70 transition-colors ${
                  isMatch ? 'bg-amber-500/20 text-amber-200' : ''
                }`}
              >
                {/* Line number */}
                <span className="w-10 sm:w-12 shrink-0 select-none text-right pr-4 text-slate-400 font-mono text-[11px]">
                  {lineNum}
                </span>

                {/* Line text */}
                <span className="text-slate-200 whitespace-pre overflow-x-visible">
                  {line || ' '}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Viewer Footer Note */}
      <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-1">
        <span>{lines.length} lines • Formatted UTF-8 source code</span>
        <span className="text-slate-400">
          VSW ML HUB Online Access • Single project copy license
        </span>
      </div>
    </div>
  );
};
