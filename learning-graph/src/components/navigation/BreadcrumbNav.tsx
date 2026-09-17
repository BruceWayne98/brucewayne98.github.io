import React from 'react';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import type { BreadcrumbItem, TopicItem } from '../../types/topic';

interface BreadcrumbNavProps {
  breadcrumbs: BreadcrumbItem[];
  currentTopic: TopicItem | null;
  onSelectTopic: (topicId: string | null) => void;
  onGoBack: () => void;
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  breadcrumbs,
  currentTopic,
  onSelectTopic,
  onGoBack,
}) => {
  return (
    <nav className="flex items-center gap-2 overflow-x-auto py-2 px-4 no-scrollbar text-sm">
      {/* Back button (when not at root) */}
      {currentTopic && (
        <button
          onClick={onGoBack}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 shadow-sm transition-all"
          title="Go to parent topic"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back</span>
        </button>
      )}

      {/* Breadcrumb path */}
      <div className="flex items-center gap-1.5 flex-nowrap whitespace-nowrap bg-white/80 dark:bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Home / Root button */}
        <button
          onClick={() => onSelectTopic(null)}
          className={`inline-flex items-center gap-1 px-1.5 py-1 rounded-md text-xs font-medium transition-colors
            ${currentTopic === null
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>All Topics</span>
        </button>

        {/* Dynamic breadcrumb nodes */}
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <React.Fragment key={item.id ?? index}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <button
                onClick={() => onSelectTopic(item.id)}
                className={`px-1.5 py-0.5 rounded text-xs transition-colors truncate max-w-[160px]
                  ${isLast
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/60'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                title={item.title}
              >
                {item.title}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
