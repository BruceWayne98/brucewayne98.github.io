import React from 'react';
import { X, FolderPlus, FileCode, CheckCircle, Sparkles } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">How to Add Your Own Topics</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <p>
            This site automatically builds its interactive graph hierarchy directly from markdown or HTML files in the <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-500 font-mono text-xs">src/content/</code> directory!
          </p>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 h-fit">
                <FolderPlus className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">1. Create a Markdown or HTML file</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Save a file anywhere inside <code className="font-mono text-xs">src/content/</code> (e.g., <code className="font-mono text-xs">src/content/ai/transformers.md</code>).
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 h-fit">
                <FileCode className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-white">2. Add Frontmatter at the top</h4>
                <pre className="mt-1 p-3 rounded-xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800">
{`---
id: diffusion-models
title: Diffusion Models
parent: deep-learning    # Set to parent's ID, or null for root
order: 3
summary: Generative models based on reversing noise diffusion.
tags: [genai, vision, diffusion]
color: purple            # indigo, purple, cyan, emerald, rose, amber
difficulty: Advanced
---

# Your notes here with LaTeX $E=mc^2$ & Mermaid diagrams!`}
                </pre>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 h-fit">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">3. Instant Hot-Reload</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Vite dynamically loads your new file into the tree and renders it instantly in the graph and search bar!
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
