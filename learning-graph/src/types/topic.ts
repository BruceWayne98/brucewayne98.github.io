export type ContentFormat = 'markdown' | 'html';

export interface TopicFrontmatter {
  id?: string;
  title: string;
  parent?: string | null;
  order?: number;
  summary?: string;
  tags?: string[];
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple' | 'blue';
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  format?: ContentFormat;
}

export interface TopicItem {
  id: string;
  title: string;
  parent: string | null;
  order: number;
  summary: string;
  tags: string[];
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple' | 'blue';
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  format: ContentFormat;
  content: string;
  childrenIds: string[];
  hasChildren: boolean;
  hasContent: boolean;
  filePath?: string;
}

export interface TopicMap {
  [id: string]: TopicItem;
}

export interface BreadcrumbItem {
  id: string | null;
  title: string;
}
