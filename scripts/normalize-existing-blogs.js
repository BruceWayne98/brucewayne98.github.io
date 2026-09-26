const fs = require('fs');
const path = require('path');

const blogsDir = path.join(__dirname, '..', 'content', 'en', 'blogs');
const files = fs.readdirSync(blogsDir);

for (const f of files) {
    if (!f.endsWith('.md') || f === '_index.md') continue;
    const fullPath = path.join(blogsDir, f);
    let text = fs.readFileSync(fullPath, 'utf-8');
    const match = text.match(/^---([\s\S]*?)---/);
    if (!match) continue;

    let yml = match[1];
    const body = text.replace(match[0], '').trim();
    const slug = f.replace('.md', '');

    let hasId = /id:\s*/.test(yml);
    let hasParent = /parent:\s*/.test(yml);
    let hasCategory = /category:\s*/.test(yml);
    let hasOrder = /order:\s*/.test(yml);
    let hasColor = /color:\s*/.test(yml);
    let hasDifficulty = /difficulty:\s*/.test(yml);

    if (!hasId) yml += `\nid: ${slug}`;
    if (!hasParent) yml += `\nparent: "computer-science"`;
    if (!hasCategory) yml += `\ncategory: "cs"`;
    if (!hasOrder) yml += `\norder: 5`;
    if (!hasColor) yml += `\ncolor: "cyan"`;
    if (!hasDifficulty) yml += `\ndifficulty: "Intermediate"`;

    const updated = `---\n${yml.trim()}\n---\n\n${body}\n`;
    fs.writeFileSync(fullPath, updated, 'utf-8');
    console.log('Normalized:', f);
}
