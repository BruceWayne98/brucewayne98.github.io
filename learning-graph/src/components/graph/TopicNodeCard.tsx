import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { BookOpen, GitBranch, ChevronRight, CheckCircle2, ExternalLink } from 'lucide-react';
import type { TopicItem } from '../../types/topic';

interface TopicNodeCardProps {
  data: {
    topic: TopicItem;
    isFocused?: boolean;
    isCurrentRoot?: boolean;
    onSelectTopic: (topicId: string) => void;
    onOpenContent: (topicId: string) => void;
  };
}

const colorMap = {
  indigo: {
    border: 'border-indigo-500/30 hover:border-indigo-500',
    ring: 'ring-indigo-500/20',
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300',
    accentBg: 'from-indigo-500/10 to-transparent',
    btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  },
  purple: {
    border: 'border-purple-500/30 hover:border-purple-500',
    ring: 'ring-purple-500/20',
    badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300',
    accentBg: 'from-purple-500/10 to-transparent',
    btn: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
  cyan: {
    border: 'border-cyan-500/30 hover:border-cyan-500',
    ring: 'ring-cyan-500/20',
    badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300',
    accentBg: 'from-cyan-500/10 to-transparent',
    btn: 'bg-cyan-600 hover:bg-cyan-700 text-white',
  },
  emerald: {
    border: 'border-emerald-500/30 hover:border-emerald-500',
    ring: 'ring-emerald-500/20',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300',
    accentBg: 'from-emerald-500/10 to-transparent',
    btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  rose: {
    border: 'border-rose-500/30 hover:border-rose-500',
    ring: 'ring-rose-500/20',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300',
    accentBg: 'from-rose-500/10 to-transparent',
    btn: 'bg-rose-600 hover:bg-rose-700 text-white',
  },
  amber: {
    border: 'border-amber-500/30 hover:border-amber-500',
    ring: 'ring-amber-500/20',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300',
    accentBg: 'from-amber-500/10 to-transparent',
    btn: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  blue: {
    border: 'border-blue-500/30 hover:border-blue-500',
    ring: 'ring-blue-500/20',
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300',
    accentBg: 'from-blue-500/10 to-transparent',
    btn: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
};

export const TopicNodeCard: React.FC<TopicNodeCardProps> = memo(({ data }) => {
  const { topic, isFocused, onSelectTopic, onOpenContent } = data;
  const colorTheme = colorMap[topic.color] || colorMap.indigo;

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking on buttons directly, let button handler execute
    if ((e.target as HTMLElement).closest('button')) return;
    
    // Default action: If it has children, explore them; otherwise open notes
    if (topic.hasChildren) {
      onSelectTopic(topic.id);
    } else if (topic.hasContent) {
      onOpenContent(topic.id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative w-[280px] rounded-2xl border transition-all duration-200 cursor-pointer text-left backdrop-blur-md shadow-md hover:shadow-xl group
        ${isFocused 
          ? `ring-4 ring-offset-2 dark:ring-offset-slate-950 ${colorTheme.ring} border-indigo-500 bg-white dark:bg-slate-900 shadow-indigo-500/10` 
          : `bg-white/95 dark:bg-slate-900/90 ${colorTheme.border} hover:-translate-y-1`
        }`}
    >
      {/* Top React Flow Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !-top-1.5 !bg-indigo-500 !border-2 !border-white dark:!border-slate-900"
      />

      {/* Decorative gradient highlight header */}
      <div className={`h-1.5 w-full rounded-t-2xl bg-gradient-to-r ${colorTheme.accentBg}`} />

      <div className="p-4 space-y-2.5">
        {/* Badges row */}
        <div className="flex items-center justify-between gap-1.5 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            {topic.hasChildren ? (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[11px] ${colorTheme.badge}`}>
                <GitBranch className="w-3 h-3" />
                {topic.childrenIds.length} {topic.childrenIds.length === 1 ? 'subtopic' : 'subtopics'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Leaf Topic
              </span>
            )}
          </div>

          {topic.difficulty && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              {topic.difficulty}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {topic.title}
        </h3>

        {/* Summary */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed h-[36px]">
          {topic.summary}
        </p>

        {/* Tags */}
        {topic.tags && topic.tags.length > 0 && (
          <div className="flex items-center gap-1 overflow-hidden pt-0.5">
            {topic.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono"
              >
                #{tag}
              </span>
            ))}
            {topic.tags.length > 3 && (
              <span className="text-[10px] text-slate-400">+{topic.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          {topic.hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectTopic(topic.id);
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-200 transition-colors"
              title="Explore subtopics in graph"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Explore</span>
              <ChevronRight className="w-3 h-3 ml-auto opacity-60" />
            </button>
          ) : (
            <div className="flex-1 text-[11px] text-slate-400 italic">No subtopics</div>
          )}

          {topic.hasContent && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenContent(topic.id);
                }}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all"
                title="Read notes and documentation"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Notes</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const url = `${window.location.origin}${window.location.pathname}?topic=${encodeURIComponent(topic.id)}&view=full`;
                  window.open(url, '_blank');
                }}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 transition-colors"
                title="Open notes in a new browser tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom React Flow Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !-bottom-1.5 !bg-indigo-500 !border-2 !border-white dark:!border-slate-900"
      />
    </div>
  );
});

TopicNodeCard.displayName = 'TopicNodeCard';
