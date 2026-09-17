import { useState, useEffect, useMemo, useCallback } from 'react';
import { loadAllTopics } from './utils/contentLoader';
import type { BreadcrumbItem, TopicItem } from './types/topic';
import { Header } from './components/layout/Header';
import { BreadcrumbNav } from './components/navigation/BreadcrumbNav';
import { GraphCanvas } from './components/graph/GraphCanvas';
import { ContentReader } from './components/content/ContentReader';
import { FullPageReader } from './components/content/FullPageReader';
import { TopicSearchModal } from './components/search/TopicSearchModal';
import { GuideModal } from './components/guide/GuideModal';

export function App() {
  // Load topics from files
  const { topicMap, rootTopicIds } = useMemo(() => loadAllTopics(), []);

  // Parse initial URL query parameters
  const initialParams = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      topic: params.get('topic'),
      view: params.get('view'),
    };
  }, []);

  // View mode state ('graph' or 'full')
  const [viewMode, setViewMode] = useState<'graph' | 'full'>(() => {
    return initialParams.view === 'full' && initialParams.topic ? 'full' : 'graph';
  });

  const [fullPageTopicId, setFullPageTopicId] = useState<string | null>(() => {
    return initialParams.view === 'full' ? initialParams.topic : null;
  });

  // Hierarchy state
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(() => {
    if (initialParams.topic && topicMap[initialParams.topic]) {
      return topicMap[initialParams.topic].parent;
    }
    return null;
  });

  const [activeContentTopicId, setActiveContentTopicId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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

  // Sync state with browser navigation (Back/Forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const topic = params.get('topic');
      const view = params.get('view');

      if (view === 'full' && topic && topicMap[topic]) {
        setViewMode('full');
        setFullPageTopicId(topic);
      } else {
        setViewMode('graph');
        setFullPageTopicId(null);
        if (topic && topicMap[topic]) {
          setCurrentTopicId(topicMap[topic].parent);
          setActiveContentTopicId(topic);
          setIsDrawerOpen(true);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [topicMap]);

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
    setActiveContentTopicId(topicId);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleOpenFullPage = useCallback((topicId: string) => {
    setFullPageTopicId(topicId);
    setViewMode('full');
    const newUrl = `${window.location.pathname}?topic=${encodeURIComponent(topicId)}&view=full`;
    window.history.pushState({ topicId, view: 'full' }, '', newUrl);
  }, []);

  const handleOpenNewTab = useCallback((topicId: string) => {
    const newUrl = `${window.location.origin}${window.location.pathname}?topic=${encodeURIComponent(topicId)}&view=full`;
    window.open(newUrl, '_blank');
  }, []);

  const handleBackToGraph = useCallback(() => {
    setViewMode('graph');
    setFullPageTopicId(null);
    window.history.pushState(null, '', window.location.pathname);
  }, []);

  const handleGoBack = useCallback(() => {
    if (!currentTopicId) return;
    const parentId = topicMap[currentTopicId]?.parent ?? null;
    setCurrentTopicId(parentId);
  }, [currentTopicId, topicMap]);

  const activeContentTopic: TopicItem | null = activeContentTopicId
    ? topicMap[activeContentTopicId] || null
    : null;

  const currentTopic: TopicItem | null = currentTopicId
    ? topicMap[currentTopicId] || null
    : null;

  const fullPageTopic: TopicItem | null = fullPageTopicId
    ? topicMap[fullPageTopicId] || null
    : null;

  // Render dedicated full-page reading mode
  if (viewMode === 'full' && fullPageTopic) {
    return (
      <FullPageReader
        topic={fullPageTopic}
        topicMap={topicMap}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onBackToGraph={handleBackToGraph}
        onNavigateToTopic={(id) => handleOpenFullPage(id)}
      />
    );
  }

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

      {/* Sliding Content Drawer */}
      <ContentReader
        topic={activeContentTopic}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onNavigateToTopic={(id) => {
          handleSelectTopic(id);
          handleOpenContent(id);
        }}
        onOpenFullPage={handleOpenFullPage}
        onOpenNewTab={handleOpenNewTab}
      />

      {/* Command Palette / Search Modal */}
      <TopicSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        topicMap={topicMap}
        onSelectTopic={handleSelectTopic}
        onOpenContent={handleOpenContent}
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
