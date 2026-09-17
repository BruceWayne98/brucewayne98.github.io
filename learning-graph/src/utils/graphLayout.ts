import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';
import type { TopicItem, TopicMap } from '../types/topic';

export interface TopicNodeData {
  topic: TopicItem;
  isFocused?: boolean;
  isCurrentRoot?: boolean;
  onSelectTopic: (topicId: string) => void;
  onOpenContent: (topicId: string) => void;
}

const NODE_WIDTH = 280;
const NODE_HEIGHT = 140;

/**
 * Calculates hierarchical layout using dagre for given nodes and edges
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 50,
    ranksep: 80,
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

/**
 * Builds the graph representation for the focused drill-down view:
 * If currentTopicId is null: renders all root topics.
 * If currentTopicId is specified: renders current focused topic at root and all its direct children.
 */
export function buildFocusedGraph(
  topicMap: TopicMap,
  rootTopicIds: string[],
  currentTopicId: string | null,
  handlers: {
    onSelectTopic: (id: string) => void;
    onOpenContent: (id: string) => void;
  }
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (currentTopicId === null) {
    // Root level: show all root topics
    rootTopicIds.forEach((id, index) => {
      const topic = topicMap[id];
      if (!topic) return;

      nodes.push({
        id: topic.id,
        type: 'topicNode',
        position: { x: index * (NODE_WIDTH + 60), y: 50 },
        data: {
          topic,
          isFocused: false,
          isCurrentRoot: true,
          onSelectTopic: handlers.onSelectTopic,
          onOpenContent: handlers.onOpenContent,
        },
      });
    });

    return { nodes, edges };
  }

  // Focused view: current topic is the root
  const currentTopic = topicMap[currentTopicId];
  if (!currentTopic) return { nodes, edges };

  // Add the focused parent node
  nodes.push({
    id: currentTopic.id,
    type: 'topicNode',
    position: { x: 0, y: 0 },
    data: {
      topic: currentTopic,
      isFocused: true,
      isCurrentRoot: true,
      onSelectTopic: handlers.onSelectTopic,
      onOpenContent: handlers.onOpenContent,
    },
  });

  // Add direct children
  currentTopic.childrenIds.forEach((childId) => {
    const childTopic = topicMap[childId];
    if (!childTopic) return;

    nodes.push({
      id: childTopic.id,
      type: 'topicNode',
      position: { x: 0, y: 0 },
      data: {
        topic: childTopic,
        isFocused: false,
        isCurrentRoot: false,
        onSelectTopic: handlers.onSelectTopic,
        onOpenContent: handlers.onOpenContent,
      },
    });

    edges.push({
      id: `${currentTopic.id}->${childTopic.id}`,
      source: currentTopic.id,
      target: childTopic.id,
      type: 'smoothstep',
      animated: true,
      style: {
        stroke: '#6366f1',
        strokeWidth: 2.5,
      },
    });
  });

  // If there are children, apply Dagre layout
  if (nodes.length > 1) {
    return getLayoutedElements(nodes, edges, 'TB');
  }

  return { nodes, edges };
}
