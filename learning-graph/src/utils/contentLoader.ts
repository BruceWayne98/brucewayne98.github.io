import type { TopicMap } from '../types/topic';
import topicsData from '../data/topics.json';

/**
 * Loads pre-synced topics and hierarchy generated from /content/en/blogs/*.md
 */
export function loadAllTopics(): { topicMap: TopicMap; rootTopicIds: string[] } {
  const data = topicsData as unknown as { topicMap: TopicMap; rootTopicIds: string[] };
  return {
    topicMap: data.topicMap || {},
    rootTopicIds: data.rootTopicIds || [],
  };
}

