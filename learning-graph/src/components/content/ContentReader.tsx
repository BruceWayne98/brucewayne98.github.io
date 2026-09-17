import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { X, Maximize2, Minimize2, Copy, Check, GitBranch, BookOpen, Clock, Tag, ExternalLink, Expand } from 'lucide-react';
import type { TopicItem } from '../../types/topic';
import { MermaidDiagram } from './MermaidDiagram';

interface ContentReaderProps {
  topic: TopicItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTopic: (topicId: string) => void;
  onOpenFullPage?: (topicId: string) => void;
  onOpenNewTab?: (topicId: string) => void;
}

export const ContentReader: React.FC<ContentReaderProps> = ({
  topic,
  isOpen,
  onClose,
  onNavigateToTopic,
  onOpenFullPage,
  onOpenNewTab,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !topic) return null;

  const handleCopyContent = () => {
    navigator.clipboard.writeText(topic.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Estimate reading time (~200 words per minute)
  const wordCount = topic.content.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
      {/* Semi-transparent backdrop - clicking closes reader */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/30 dark:bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity"
      />

      {/* Slide-over Drawer Panel */}
      <div
        className={`relative z-10 flex flex-col h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 pointer-events-auto transition-all duration-300 ease-in-out
          ${isFullscreen ? 'w-full max-w-full' : 'w-full md:w-[600px] lg:w-[680px]'}`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
                  {topic.format === 'html' ? 'HTML Note' : 'Markdown Note'}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="w-3 h-3" />
                  {readingTime} min read
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                {topic.title}
              </h2>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 ml-4">
            {onOpenFullPage && (
              <button
                onClick={() => {
                  onOpenFullPage(topic.id);
                  onClose();
                }}
                className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Expand to Full Page"
              >
                <Expand className="w-4 h-4" />
              </button>
            )}

            {onOpenNewTab && (
              <button
                onClick={() => onOpenNewTab(topic.id)}
                className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Open in new browser tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleCopyContent}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={copied ? 'Copied to clipboard' : 'Copy raw content'}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:flex"
              title={isFullscreen ? 'Restore split view' : 'Expand drawer width'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close reader"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tags and Metadata Bar */}
        {(topic.tags.length > 0 || topic.difficulty) && (
          <div className="px-6 py-2.5 bg-slate-100/50 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center flex-wrap gap-2 text-xs">
            {topic.difficulty && (
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                Level: {topic.difficulty}
              </span>
            )}
            {topic.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono text-[11px]"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Scrollable Content View */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
          <div className="max-w-3xl mx-auto">
            {topic.format === 'html' ? (
              /* Raw HTML format renderer */
              <div
                className="markdown-body select-text"
                dangerouslySetInnerHTML={{ __html: topic.content }}
              />
            ) : (
              /* Markdown + Math (KaTeX) + Flowcharts (Mermaid) + HTML renderer */
              <div className="markdown-body select-text">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex, rehypeRaw]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : '';

                      // Intercept Mermaid code blocks
                      if (language === 'mermaid') {
                        return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />;
                      }

                      // Standard inline code
                      if (!match) {
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }

                      // Code block with syntax styling
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
              </div>
            )}

            {/* Subtopics quick jump pills inside notes */}
            {topic.hasChildren && (
              <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
                  Subtopics in this section ({topic.childrenIds.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {topic.childrenIds.map((childId) => (
                    <button
                      key={childId}
                      onClick={() => onNavigateToTopic(childId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                    >
                      <span>Explore {childId}</span>
                      <GitBranch className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
