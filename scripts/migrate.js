const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'learning-graph', 'src', 'content');
const destDir = path.join(__dirname, '..', 'content', 'en', 'blogs');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

function parseFrontmatter(text) {
    const match = text.match(/^---([\s\S]*?)---/);
    if (!match) return { yml: '', body: text };
    return { yml: match[1], body: text.replace(match[0], '').trim() };
}

function migrateDir(dir, cat = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            migrateDir(fullPath, entry.name);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
            const raw = fs.readFileSync(fullPath, 'utf-8');
            const { yml, body } = parseFrontmatter(raw);
            
            const idMatch = yml.match(/id:\s*["']?([^"'\r\n]+)["']?/);
            const titleMatch = yml.match(/title:\s*["']?([^"'\r\n]+)["']?/);
            const parentMatch = yml.match(/parent:\s*["']?([^"'\r\n]+)["']?/);
            const orderMatch = yml.match(/order:\s*(\d+)/);
            const summaryMatch = yml.match(/summary:\s*["']?([^"'\r\n]+)["']?/);
            const colorMatch = yml.match(/color:\s*["']?([^"'\r\n]+)["']?/);
            const diffMatch = yml.match(/difficulty:\s*["']?([^"'\r\n]+)["']?/);
            const tagsMatch = yml.match(/tags:\s*\[(.*?)\]/);
            const dateMatch = yml.match(/date:\s*["']?([^"'\r\n]+)["']?/);

            const id = idMatch ? idMatch[1].trim() : entry.name.replace('.md', '');
            const title = titleMatch ? titleMatch[1].trim() : id;
            let parent = parentMatch ? parentMatch[1].trim() : null;
            if (parent === 'null' || parent === '' || parent === 'None') parent = null;
            const order = orderMatch ? parseInt(orderMatch[1], 10) : 1;
            const summary = summaryMatch ? summaryMatch[1].trim() : title;
            const color = colorMatch ? colorMatch[1].trim() : 'indigo';
            const diff = diffMatch ? diffMatch[1].trim() : 'Intermediate';
            const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim().replace(/["']/g, '')).filter(Boolean) : [cat || 'tech'];
            const date = dateMatch ? dateMatch[1].trim() : '2024-11-01T12:00:00+05:30';

            const newFrontmatter = [
                '---',
                `title: "${title}"`,
                `date: ${date}`,
                'draft: false',
                `tags: [${tags.map(t => '"' + t + '"').join(', ')}]`,
                `summary: "${summary}"`,
                `description: "${summary}"`,
                `id: ${id}`,
                parent ? `parent: "${parent}"` : 'parent: null',
                `order: ${order}`,
                `category: "${cat || 'cs'}"`,
                `color: "${color}"`,
                `difficulty: "${diff}"`,
                '---',
                '',
                body,
                ''
            ].join('\n');

            const destFile = path.join(destDir, entry.name);
            fs.writeFileSync(destFile, newFrontmatter, 'utf-8');
            console.log('Migrated:', entry.name, '->', destFile);
        }
    }
}

migrateDir(srcDir);
console.log('Content migration complete!');
