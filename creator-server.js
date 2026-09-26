const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3333;
const ROOT_DIR = __dirname;

// Helper to scan markdown files in content/en/blogs
function scanTopics() {
    const topics = {};
    const blogsDir = path.join(ROOT_DIR, 'content', 'en', 'blogs');
    
    if (!fs.existsSync(blogsDir)) {
        return topics;
    }

    const entries = fs.readdirSync(blogsDir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== '_index.md') {
            const fullPath = path.join(blogsDir, entry.name);
            try {
                const text = fs.readFileSync(fullPath, 'utf-8');
                const match = text.match(/^---([\s\S]*?)---/);
                if (match) {
                    const yml = match[1];
                    const idMatch = yml.match(/id:\s*["']?([^"'\r\n]+)["']?/);
                    const titleMatch = yml.match(/title:\s*["']?([^"'\r\n]+)["']?/);
                    const parentMatch = yml.match(/parent:\s*["']?([^"'\r\n]+)["']?/);
                    const orderMatch = yml.match(/order:\s*(\d+)/);
                    const catMatch = yml.match(/category:\s*["']?([^"'\r\n]+)["']?/);

                    const id = idMatch ? idMatch[1].trim() : entry.name.replace('.md', '');
                    const title = titleMatch ? titleMatch[1].trim() : id;
                    let parent = parentMatch ? parentMatch[1].trim() : null;
                    if (parent === 'null' || parent === '' || parent === 'None') parent = null;
                    const order = orderMatch ? parseInt(orderMatch[1], 10) : 99;
                    const finalCategory = (catMatch ? catMatch[1].trim() : null) || 'cs';

                    topics[id] = {
                        id,
                        title,
                        parent,
                        category: finalCategory,
                        order
                    };
                }
            } catch (e) {
                console.error('Error reading blog topic file:', fullPath, e);
            }
        }
    }

    return topics;
}

const server = http.createServer((req, res) => {
    // Enable CORS for file:// access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://localhost:${PORT}`);

    // GET /api/topics -> Return all current topics from blogs
    if (req.method === 'GET' && url.pathname === '/api/topics') {
        const topics = scanTopics();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, topics }));
        return;
    }

    // POST /api/save -> Save markdown file directly to disk
    if (req.method === 'POST' && url.pathname === '/api/save') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const relPath = data.path;
                const content = data.content;

                if (!relPath || !content) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing path or content' }));
                    return;
                }

                // Security: ensure the resolved path stays within the repository
                const fullPath = path.resolve(ROOT_DIR, relPath);
                if (!fullPath.startsWith(ROOT_DIR)) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Access denied: Path outside repository' }));
                    return;
                }

                // Ensure target directory exists
                const targetDir = path.dirname(fullPath);
                fs.mkdirSync(targetDir, { recursive: true });

                // Write file directly to disk
                fs.writeFileSync(fullPath, content, 'utf-8');

                console.log(`[Auto-Save] Successfully wrote: ${relPath}`);

                // Automatically sync graph topics and rebuild Knowledge Graph
                let graphRebuilding = false;
                if (relPath.includes('blogs') || relPath.includes('learning-graph')) {
                    graphRebuilding = true;
                    console.log(`[Auto-Build] Syncing topics and rebuilding Knowledge Graph...`);
                    const buildCmd = process.platform === 'win32' ? 'npm.cmd run build:graph' : 'npm run build:graph';
                    exec(buildCmd, { cwd: ROOT_DIR }, (err, stdout, stderr) => {
                        if (err) {
                            console.error('[Auto-Build] Knowledge Graph build error:', err);
                        } else {
                            console.log('[Auto-Build] Knowledge Graph successfully updated with new blog post!');
                        }
                    });
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    path: relPath,
                    fullPath: fullPath,
                    graphRebuilding: graphRebuilding
                }));
            } catch (err) {
                console.error('Error saving file:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // Serve content-creator.html
    if (url.pathname === '/' || url.pathname === '/content-creator.html') {
        const htmlPath = path.join(ROOT_DIR, 'content-creator.html');
        if (fs.existsSync(htmlPath)) {
            const html = fs.readFileSync(htmlPath, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
            return;
        }
    }

    // Fallback 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 Content Creator Local Server Running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`💾 Auto-Save: Enabled directly to repo directories`);
    console.log(`=================================================`);

    // Auto-open in default browser on Windows
    if (process.platform === 'win32') {
        exec(`start http://localhost:${PORT}`);
    } else if (process.platform === 'darwin') {
        exec(`open http://localhost:${PORT}`);
    } else {
        exec(`xdg-open http://localhost:${PORT}`);
    }
});
