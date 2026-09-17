import React from 'react';
import { Network, Search, Sun, Moon, HelpCircle, Layers, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSearch: () => void;
  onOpenGuide: () => void;
  totalTopicsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenSearch,
  onOpenGuide,
  totalTopicsCount,
}) => {
  return (
    <header className="h-16 px-4 md:px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between select-none z-30 relative">
      {/* Brand logo & Return to Portfolio */}
      <div className="flex items-center gap-3">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80 transition-colors shadow-sm"
          title="Return to Main Portfolio"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Portfolio</span>
        </a>

        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <Network className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base md:text-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 dark:from-indigo-400 dark:via-purple-300 dark:to-cyan-400 bg-clip-text text-transparent">
              KnowledgeGraph
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              Interactive
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
            Hierarchical Learning Map & Notes
          </p>
        </div>
      </div>

      {/* Center Search button trigger */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700/70 text-xs transition-all shadow-sm"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-slate-600 dark:text-slate-300">Search topics, formulas, tags...</span>
          <span className="sm:hidden">Search</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-slate-400">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Topics count badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          <span className="font-semibold">{totalTopicsCount}</span>
          <span className="text-slate-400">topics</span>
        </div>

        {/* How to add notes guide */}
        <button
          onClick={onOpenGuide}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="How to add new notes"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Dark mode switch */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};
