import React, { useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import { TopicNodeCard } from './TopicNodeCard';
import type { TopicMap } from '../../types/topic';
import { buildFocusedGraph } from '../../utils/graphLayout';
import { Layers, Sparkles } from 'lucide-react';

interface GraphCanvasProps {
  topicMap: TopicMap;
  rootTopicIds: string[];
  currentTopicId: string | null;
  darkMode: boolean;
  onSelectTopic: (topicId: string) => void;
  onOpenContent: (topicId: string) => void;
}

const nodeTypes = {
  topicNode: TopicNodeCard,
};

const GraphCanvasInner: React.FC<GraphCanvasProps> = ({
  topicMap,
  rootTopicIds,
  currentTopicId,
  darkMode,
  onSelectTopic,
  onOpenContent,
}) => {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const currentTopic = currentTopicId ? topicMap[currentTopicId] : null;

  // Rebuild graph elements whenever active topic or data changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = buildFocusedGraph(
      topicMap,
      rootTopicIds,
      currentTopicId,
      {
        onSelectTopic,
        onOpenContent,
      }
    );

    setNodes(newNodes);
    setEdges(newEdges);

    // Smoothly animate camera to fit newly rendered graph
    const timer = setTimeout(() => {
      fitView({ padding: 0.25, duration: 400 });
    }, 50);

    return () => clearTimeout(timer);
  }, [topicMap, rootTopicIds, currentTopicId, onSelectTopic, onOpenContent, fitView, setNodes, setEdges]);

  // Leaf topic reached notification banner
  const isLeafWithoutChildren = currentTopic && !currentTopic.hasChildren;

  return (
    <div className="relative w-full h-full bg-slate-50 dark:bg-slate-950 select-none">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color={darkMode ? '#334155' : '#cbd5e1'}
        />

        <Controls
          showInteractive={false}
          className="!bg-white/90 dark:!bg-slate-900/90 !border !border-slate-200 dark:!border-slate-800 !rounded-xl !shadow-lg !overflow-hidden"
        />

        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(node) => {
            if (node.id === currentTopicId) return '#6366f1';
            return darkMode ? '#1e293b' : '#e2e8f0';
          }}
          maskColor={darkMode ? 'rgba(15, 23, 42, 0.7)' : 'rgba(241, 245, 249, 0.7)'}
          className="!bg-white/80 dark:!bg-slate-900/80 !border !border-slate-200 dark:!border-slate-800 !rounded-xl !shadow-lg !overflow-hidden hidden sm:block"
        />

        {/* Informational overlay for Leaf Topics */}
        {isLeafWithoutChildren && (
          <Panel position="top-center" className="mt-4">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-indigo-500/30 shadow-xl backdrop-blur-md">
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-slate-900 dark:text-white">Leaf Node Reached:</span>{' '}
                <span className="text-slate-600 dark:text-slate-400">
                  This topic has no further subtopics. Click{' '}
                </span>
                <button
                  onClick={() => { window.location.href = `/blogs/${currentTopic.id}/`; }}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 underline underline-offset-2 ml-1"
                >
                  Read Blog
                </button>
              </div>
            </div>
          </Panel>
        )}

        {/* Empty state overlay when starting from scratch */}
        {rootTopicIds.length === 0 && (
          <Panel position="top-center" className="mt-20">
            <div className="flex flex-col items-center gap-3 px-8 py-8 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-md text-center max-w-sm">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">Knowledge Graph Ready</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  No topics published yet. Launch the Content Creator to write your first article and grow your knowledge graph!
                </p>
              </div>
            </div>
          </Panel>
        )}

        {/* View status indicator */}
        <Panel position="bottom-center" className="mb-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 backdrop-blur-sm shadow-sm">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              {currentTopic
                ? `Showing: ${currentTopic.title} (${currentTopic.childrenIds.length} direct subtopics)`
                : `Showing Top-Level Parent Categories (${rootTopicIds.length} categories)`}
            </span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export const GraphCanvas: React.FC<GraphCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner {...props} />
    </ReactFlowProvider>
  );
};
