import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  GitBranch,
  Clock,
  Tag,
  Share2,
  Sun,
  Moon,
} from 'lucide-react';
import type { TopicItem, TopicMap } from '../../types/topic';
import { MermaidDiagram } from './MermaidDiagram';

interface FullPageReaderProps {
  topic: TopicItem;
  topicMap: TopicMap;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onBackToGraph: () => void;
  onNavigateToTopic: (topicId: string) => void;
}

export const FullPageReader: React.FC<FullPageReaderProps> = ({
  topic,
  topicMap,
  darkMode,
  onToggleDarkMode,
  onBackToGraph,
  onNavigateToTopic,
}) => {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyContent = () => {
    navigator.clipboard.writeText(topic.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?topic=${encodeURIComponent(topic.id)}&view=full`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleOpenNewTab = () => {
    const url = `${window.location.origin}${window.location.pathname}?topic=${encodeURIComponent(topic.id)}&view=full`;
    window.open(url, '_blank');
  };

  // Compute ancestor path
  const getAncestorTrail = (): { id: string; title: string }[] => {
    const trail: { id: string; title: string }[] = [];
    let curr = topic;
    while (curr.parent && topicMap[curr.parent]) {
      const parent = topicMap[curr.parent];
      trail.unshift({ id: parent.id, title: parent.title });
      curr = parent;
    }
    return trail;
  };

  const ancestors = getAncestorTrail();
  const wordCount = topic.content.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top sticky header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBackToGraph}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80 transition-colors shadow-sm flex-shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Graph</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 min-w-0 truncate">
            {ancestors.map((item) => (
              <React.Fragment key={item.id}>
                <button
                  onClick={() => onNavigateToTopic(item.id)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 truncate max-w-[120px]"
                >
                  {item.title}
                </button>
                <span>/</span>
              </React.Fragment>
            ))}
            <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
              {topic.title}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleShareLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
            title="Copy shareable link"
          >
            {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{linkCopied ? 'Link Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={handleOpenNewTab}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Open in new browser tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopyContent}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title={copied ? 'Copied to clipboard' : 'Copy raw content'}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main article body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 sm:px-12 py-10 sm:py-14">
        {/* Article Meta Header */}
        <div className="mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              {topic.format === 'html' ? 'HTML Note' : 'Markdown Note'}
            </span>
            {topic.difficulty && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {topic.difficulty}
              </span>
            )}
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              {readingTime} min read
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {topic.title}
          </h1>

          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {topic.summary}
          </p>

          {topic.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {topic.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-mono"
                >
                  <Tag className="w-3 h-3 text-indigo-500" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content Render */}
        <article className="markdown-body select-text">
          {topic.format === 'html' ? (
            <div dangerouslySetInnerHTML={{ __html: topic.content }} />
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex, rehypeRaw]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';

                  if (language === 'mermaid') {
                    return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />;
                  }

                  if (!match) {
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }

                  return (
                    <div className="relative group/code my-4">
                      <pre className="!mt-0 !mb-0 font-mono text-sm bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto border border-slate-800">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  );
                },
              }}
            >
              {topic.content}
            </ReactMarkdown>
          )}
        </article>

        {/* Subtopics Navigation Section */}
        {topic.hasChildren && (
          <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-500" />
              Subtopics in this Topic ({topic.childrenIds.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topic.childrenIds.map((childId) => {
                const child = topicMap[childId];
                if (!child) return null;
                return (
                  <button
                    key={childId}
                    onClick={() => onNavigateToTopic(childId)}
                    className="p-4 rounded-xl text-left bg-slate-50 dark:bg-slate-900/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group"
                  >
                    <div className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {child.title}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {child.summary}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Back to top / back to graph bottom bar */}
        <div className="mt-16 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onBackToGraph}
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Interactive Graph</span>
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Back to top ↑
          </button>
        </div>
      </main>
    </div>
  );
};
