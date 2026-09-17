import { load } from 'js-yaml';
import type { TopicFrontmatter, TopicMap } from '../types/topic';

/**
 * Splits raw content into YAML frontmatter and body.
 */
export function parseFrontmatter(rawContent: string): { frontmatter: TopicFrontmatter; body: string } {
  const trimmed = rawContent.trim();
  
  if (trimmed.startsWith('---')) {
    const endPos = trimmed.indexOf('---', 3);
    if (endPos !== -1) {
      const yamlStr = trimmed.substring(3, endPos).trim();
      const body = trimmed.substring(endPos + 3).trim();
      try {
        const parsed = load(yamlStr) as TopicFrontmatter;
        return {
          frontmatter: parsed || { title: 'Untitled' },
          body,
        };
      } catch (e) {
        console.warn('Error parsing frontmatter YAML:', e);
      }
    }
  }

  // Check for HTML comment style frontmatter: <!-- --- ... --- -->
  const htmlMatch = trimmed.match(/^<!--\s*---\s*([\s\S]*?)\s*---\s*-->/);
  if (htmlMatch) {
    try {
      const parsed = load(htmlMatch[1]) as TopicFrontmatter;
      const body = trimmed.replace(htmlMatch[0], '').trim();
      return {
        frontmatter: parsed || { title: 'Untitled' },
        body,
      };
    } catch (e) {
      console.warn('Error parsing HTML frontmatter:', e);
    }
  }

  // Fallback: extract title from first # Header if available
  let title = 'Untitled Topic';
  const headerMatch = trimmed.match(/^#\s+(.+)$/m);
  if (headerMatch) {
    title = headerMatch[1].trim();
  }

  return {
    frontmatter: { title },
    body: trimmed,
  };
}

/**
 * Loads all Markdown and HTML files from /src/content/** dynamically via Vite's import.meta.glob
 */
export function loadAllTopics(): { topicMap: TopicMap; rootTopicIds: string[] } {
  // Vite dynamic imports for all content files
  const mdModules = import.meta.glob('/src/content/**/*.{md,markdown}', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  const htmlModules = import.meta.glob('/src/content/**/*.html', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  const topicMap: TopicMap = {};

  const processFile = (filePath: string, rawContent: string, defaultFormat: 'markdown' | 'html') => {
    const filename = filePath.split('/').pop()?.replace(/\.(md|markdown|html)$/i, '') || 'unknown';
    const { frontmatter, body } = parseFrontmatter(rawContent);

    const id = frontmatter.id || filename;
    const title = frontmatter.title || filename.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const parent = frontmatter.parent ?? null;
    const order = frontmatter.order ?? 99;
    const summary = frontmatter.summary || (body.slice(0, 140).replace(/#+\s/g, '').replace(/[*_`]/g, '').trim() + '...');
    const tags = frontmatter.tags || [];
    const color = frontmatter.color || 'indigo';
    const difficulty = frontmatter.difficulty;
    const format = frontmatter.format || defaultFormat;

    topicMap[id] = {
      id,
      title,
      parent,
      order,
      summary,
      tags,
      color,
      difficulty,
      format,
      content: body,
      childrenIds: [],
      hasChildren: false,
      hasContent: body.length > 0,
      filePath,
    };
  };

  // Process markdown modules
  for (const [path, content] of Object.entries(mdModules)) {
    processFile(path, content, 'markdown');
  }

  // Process HTML modules
  for (const [path, content] of Object.entries(htmlModules)) {
    processFile(path, content, 'html');
  }

  // Build parent-child relationships
  const rootTopicIds: string[] = [];

  for (const id of Object.keys(topicMap)) {
    const item = topicMap[id];
    if (item.parent && topicMap[item.parent]) {
      topicMap[item.parent].childrenIds.push(id);
    } else {
      rootTopicIds.push(id);
    }
  }

  // Sort children by order
  for (const item of Object.values(topicMap)) {
    item.childrenIds.sort((a, b) => {
      const orderA = topicMap[a]?.order ?? 99;
      const orderB = topicMap[b]?.order ?? 99;
      return orderA - orderB;
    });
    item.hasChildren = item.childrenIds.length > 0;
  }

  // Sort root topics
  rootTopicIds.sort((a, b) => {
    const orderA = topicMap[a]?.order ?? 99;
    const orderB = topicMap[b]?.order ?? 99;
    return orderA - orderB;
  });

  return { topicMap, rootTopicIds };
}
