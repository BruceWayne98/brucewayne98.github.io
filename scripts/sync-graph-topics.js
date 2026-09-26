const fs = require('fs');
const path = require('path');

const blogsDir = path.join(__dirname, '..', 'content', 'en', 'blogs');
const dataDir = path.join(__dirname, '..', 'learning-graph', 'src', 'data');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

function parseFrontmatter(text) {
    const match = text.match(/^---([\s\S]*?)---/);
    if (!match) return { yml: '', body: text };
    return { yml: match[1], body: text.replace(match[0], '').trim() };
}

function syncTopics() {
    const files = fs.readdirSync(blogsDir);
    const topicMap = {};

    for (const f of files) {
        if (!f.endsWith('.md') || f === '_index.md') continue;
        const fullPath = path.join(blogsDir, f);
        const raw = fs.readFileSync(fullPath, 'utf-8');
        const { yml, body } = parseFrontmatter(raw);

        const idMatch = yml.match(/id:\s*["']?([^"'\r\n]+)["']?/);
        const titleMatch = yml.match(/title:\s*["']?([^"'\r\n]+)["']?/);
        const parentMatch = yml.match(/parent:\s*["']?([^"'\r\n]+)["']?/);
        const orderMatch = yml.match(/order:\s*(\d+)/);
        const summaryMatch = yml.match(/summary:\s*["']?([^"'\r\n]+)["']?/);
        const descMatch = yml.match(/description:\s*["']?([^"'\r\n]+)["']?/);
        const colorMatch = yml.match(/color:\s*["']?([^"'\r\n]+)["']?/);
        const diffMatch = yml.match(/difficulty:\s*["']?([^"'\r\n]+)["']?/);
        const catMatch = yml.match(/category:\s*["']?([^"'\r\n]+)["']?/);
        const tagsMatch = yml.match(/tags:\s*\[(.*?)\]/);

        const id = idMatch ? idMatch[1].trim() : f.replace('.md', '');
        const title = titleMatch ? titleMatch[1].trim() : id;
        let parent = parentMatch ? parentMatch[1].trim() : null;
        if (parent === 'null' || parent === '' || parent === 'None') parent = null;
        const order = orderMatch ? parseInt(orderMatch[1], 10) : 99;
        const summary = summaryMatch ? summaryMatch[1].trim() : (descMatch ? descMatch[1].trim() : title);
        const color = colorMatch ? colorMatch[1].trim() : 'indigo';
        const difficulty = diffMatch ? diffMatch[1].trim() : 'Intermediate';
        const category = catMatch ? catMatch[1].trim() : 'cs';
        const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim().replace(/["']/g, '')).filter(Boolean) : [];

        topicMap[id] = {
            id,
            title,
            parent,
            order,
            summary,
            tags,
            color,
            difficulty,
            category,
            childrenIds: [],
            hasChildren: false,
            hasContent: true,
            url: `/blogs/${id}/`
        };
    }

    const rootTopicIds = [];

    // Build hierarchy
    for (const id of Object.keys(topicMap)) {
        const item = topicMap[id];
        if (item.parent && topicMap[item.parent]) {
            topicMap[item.parent].childrenIds.push(id);
        } else {
            rootTopicIds.push(id);
        }
    }

    // Sort children
    for (const item of Object.values(topicMap)) {
        item.childrenIds.sort((a, b) => (topicMap[a]?.order ?? 99) - (topicMap[b]?.order ?? 99));
        item.hasChildren = item.childrenIds.length > 0;
    }

    // Sort roots
    rootTopicIds.sort((a, b) => (topicMap[a]?.order ?? 99) - (topicMap[b]?.order ?? 99));

    const outputPath = path.join(dataDir, 'topics.json');
    fs.writeFileSync(outputPath, JSON.stringify({ topicMap, rootTopicIds }, null, 2), 'utf-8');
    console.log(`[Sync] Successfully synced ${Object.keys(topicMap).length} topics to ${outputPath}`);
    console.log(`[Sync] Root Topics (${rootTopicIds.length}):`, rootTopicIds.join(', '));
}

syncTopics();
