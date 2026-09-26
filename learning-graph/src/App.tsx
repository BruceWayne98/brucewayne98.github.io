import { useState, useEffect, useMemo, useCallback } from 'react';
import { loadAllTopics } from './utils/contentLoader';
import type { BreadcrumbItem, TopicItem } from './types/topic';
import { Header } from './components/layout/Header';
import { BreadcrumbNav } from './components/navigation/BreadcrumbNav';
import { GraphCanvas } from './components/graph/GraphCanvas';
import { TopicSearchModal } from './components/search/TopicSearchModal';
import { GuideModal } from './components/guide/GuideModal';

export function App() {
  // Load topics from synced JSON
  const { topicMap, rootTopicIds } = useMemo(() => loadAllTopics(), []);

  // Parse initial URL query parameters
  const initialParams = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      topic: params.get('topic'),
      view: params.get('view'),
    };
  }, []);

  // Hierarchy state
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(() => {
    if (initialParams.topic && topicMap[initialParams.topic]) {
      return topicMap[initialParams.topic].parent;
    }
    return null;
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Global keyboard shortcuts (Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute breadcrumb path for current topic
  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    if (!currentTopicId) return [];

    const trail: BreadcrumbItem[] = [];
    let curr = topicMap[currentTopicId];

    while (curr) {
      trail.unshift({ id: curr.id, title: curr.title });
      if (!curr.parent) break;
      curr = topicMap[curr.parent];
    }

    return trail;
  }, [currentTopicId, topicMap]);

  // Navigation handlers
  const handleSelectTopic = useCallback((topicId: string | null) => {
    setCurrentTopicId(topicId);
  }, []);

  const handleOpenContent = useCallback((topicId: string) => {
    window.location.href = `/blogs/${topicId}/`;
  }, []);

  const handleGoBack = useCallback(() => {
    if (!currentTopicId) return;
    const parentId = topicMap[currentTopicId]?.parent ?? null;
    setCurrentTopicId(parentId);
  }, [currentTopicId, topicMap]);

  const currentTopic: TopicItem | null = currentTopicId
    ? topicMap[currentTopicId] || null
    : null;

  // Render interactive graph view
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 select-none">
      {/* Top Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        totalTopicsCount={Object.keys(topicMap).length}
      />

      {/* Sub-header Navigation Bar (Breadcrumbs & Back button) */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-900/40 backdrop-blur-sm z-20 flex items-center justify-between px-2">
        <BreadcrumbNav
          breadcrumbs={breadcrumbs}
          currentTopic={currentTopic}
          onSelectTopic={handleSelectTopic}
          onGoBack={handleGoBack}
        />
      </div>

      {/* Main Interactive Graph Canvas */}
      <main className="flex-1 relative overflow-hidden">
        <GraphCanvas
          topicMap={topicMap}
          rootTopicIds={rootTopicIds}
          currentTopicId={currentTopicId}
          darkMode={darkMode}
          onSelectTopic={handleSelectTopic}
          onOpenContent={handleOpenContent}
        />
      </main>

      {/* Command Palette / Search Modal */}
      <TopicSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        topicMap={topicMap}
        onSelectTopic={handleSelectTopic}
      />

      {/* Guide Modal on how to add markdown notes */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}

export default App;
