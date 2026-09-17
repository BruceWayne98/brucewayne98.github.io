import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, GitBranch, BookOpen, Hash } from 'lucide-react';
import type { TopicMap } from '../../types/topic';

interface TopicSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicMap: TopicMap;
  onSelectTopic: (topicId: string) => void;
  onOpenContent: (topicId: string) => void;
}

export const TopicSearchModal: React.FC<TopicSearchModalProps> = ({
  isOpen,
  onClose,
  topicMap,
  onSelectTopic,
  onOpenContent,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global key listener for Escape and Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Get full ancestor path title for a topic
  const getAncestorTrail = (topicId: string): string[] => {
    const trail: string[] = [];
    let curr = topicMap[topicId];
    while (curr?.parent && topicMap[curr.parent]) {
      trail.unshift(topicMap[curr.parent].title);
      curr = topicMap[curr.parent];
    }
    return trail;
  };

  // Filter topics
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return Object.values(topicMap).slice(0, 8);

    return Object.values(topicMap).filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
      const matchContent = item.content.toLowerCase().includes(q);
      return matchTitle || matchSummary || matchTags || matchContent;
    });
  }, [query, topicMap]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics, tags, algorithms, equations..."
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No matching topics found for "{query}"
            </div>
          ) : (
            results.map((topic) => {
              const ancestors = getAncestorTrail(topic.id);
              return (
                <div
                  key={topic.id}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/60"
                >
                  <div
                    onClick={() => {
                      onSelectTopic(topic.id);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer min-w-0 pr-3"
                  >
                    {ancestors.length > 0 && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5 font-medium">
                        {ancestors.join(' > ')}
                      </div>
                    )}
                    <div className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {topic.title}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {topic.summary}
                    </p>
                    {topic.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 overflow-hidden">
                        {topic.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono"
                          >
                            <Hash className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {topic.hasChildren && (
                      <button
                        onClick={() => {
                          onSelectTopic(topic.id);
                          onClose();
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-colors"
                        title="Explore subtopics in graph"
                      >
                        <GitBranch className="w-4 h-4" />
                      </button>
                    )}
                    {topic.hasContent && (
                      <button
                        onClick={() => {
                          onOpenContent(topic.id);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                        title="Read notes"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Notes</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{results.length} topics available</span>
          <span>Click to explore graph or read notes</span>
        </div>
      </div>
    </div>
  );
};
