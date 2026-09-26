# Content Management & Editing Guide

Welcome to your updated, modern website! This repository is organized with a strict separation between **Design (HTML/CSS layouts)** and **Content**:

1. **Blog Posts & Knowledge Graph**: 100% pure **Markdown (`.md`)** files.
2. **All Other Site Content**: Clean, structured **JSON (`.json`)** files in `data/en/`.
3. **Zero Hardcoded HTML**: Every title, subtitle, stat, and text block across your pages is dynamically loaded from data files.

---

## Quick Reference: Where to Edit Content

| To Update... | Edit File | Format |
| :--- | :--- | :--- |
| **Author Name, Bio, Social Links, Certifications, Honors** | `data/en/author.json` | JSON |
| **Homepage Hero, Impact Numbers & Call-to-Action** | `data/en/home.json` | JSON |
| **Work Experience Timeline & Bullet Points** | `data/en/experience.json` | JSON |
| **Research Papers & Reading List** | `data/en/papers.json` | JSON |
| **Projects List (GitHub / Demo links, tags)** | `data/en/projects.json` | JSON |
| **Skills & Tech Stack Icons (Devicon classes)** | `data/en/tech.json` | JSON |
| **Contact Page Text, Form endpoint & Availability** | `data/en/contact.json` | JSON |
| **Blog Articles & Knowledge Graph Content** | `content/en/blogs/*.md` | Markdown (`.md`) |
| **All Other Site Sections (Experience, Projects, Papers...)** | `data/en/*.json` | Structured JSON |

> 💡 **Visual Content Creator Tool**: You can double-click [`start-creator.bat`](file:///d:/Books/brucewayne98.github.io/start-creator.bat) to open the interactive GUI editor at `http://localhost:3333` that automatically formats frontmatter, renders live Markdown previews with KaTeX and Mermaid, and saves directly to `content/en/blogs/` with automatic Knowledge Graph rebuilding!

---

## 1. JSON Data Files (`data/en/`)

All site sections outside of blogs and the knowledge graph are driven by simple JSON files.

### 👤 Author & Profile (`data/en/author.json`)
Controls your global profile metadata shown in the header, footer, hero, and sidebar:
```json
{
  "name": "Bharath Kumar",
  "role": "Senior Software Engineer",
  "avatar_initials": "BK",
  "location": "Bengaluru, India",
  "status": "Available for new opportunities",
  "bio_short": "Designing fault-tolerant distributed backends...",
  "socials": {
    "github": "https://github.com/brucewayne98",
    "linkedin": "https://linkedin.com/in/bharathkumar",
    "twitter": "https://twitter.com",
    "email": "mailto:bharath@example.com"
  },
  "certifications": [
    {
      "name": "AWS Certified Solutions Architect",
      "issuer": "Amazon Web Services",
      "year": "2023",
      "credential_url": "https://..."
    }
  ],
  "honors": [
    {
      "title": "Engineering Excellence Award",
      "issuer": "Company Name",
      "year": "2024",
      "description": "Recognized for architecting real-time streaming pipeline."
    }
  ]
}
```

### 🏠 Homepage Hero & Metrics (`data/en/home.json`)
Controls the homepage hero heading, subheadings, and quick impact metrics:
```json
{
  "hero": {
    "greeting": "Hi, I'm Bharath",
    "tagline": "Architecting resilient, hyper-scale distributed systems.",
    "description": "Specialized in Golang, Kubernetes, and distributed streaming architectures.",
    "cta_primary": { "label": "Explore Projects", "url": "/projects/" },
    "cta_secondary": { "label": "Read Research Notes", "url": "/papers/" }
  },
  "impact_stats": [
    { "metric": "99.99%", "label": "Uptime Maintained" },
    { "metric": "50M+", "label": "Daily Events Processed" },
    { "metric": "40%", "label": "Cloud Cost Reduction" },
    { "metric": "6+", "label": "Years Experience" }
  ]
}
```

### 💼 Experience Timeline (`data/en/experience.json`)
Controls the timeline cards displayed on `/experience/` and on the homepage:
```json
{
  "timeline": [
    {
      "role": "Senior Software Engineer",
      "company": "Tech Corp",
      "company_url": "https://example.com",
      "period": "2022 - Present",
      "location": "Bengaluru, India",
      "points": [
        "Architected event-driven microservices handling 50M+ requests daily.",
        "Reduced p99 latency from 180ms to 24ms through database connection pooling."
      ],
      "skills": ["Go", "Kubernetes", "Kafka", "PostgreSQL", "gRPC"]
    }
  ]
}
```

### 📄 Research Papers (`data/en/papers.json`)
Controls the research paper library on `/papers/`:
```json
{
  "papers": [
    {
      "title": "Spanner: Google's Globally-Distributed Database",
      "authors": "Corbett et al.",
      "year": 2012,
      "summary": "Google's globally distributed database that provides external consistency using TrueTime API.",
      "paper_link": "https://research.google/pubs/pub39966/",
      "blog_link": "/blogs/spanner-notes/"
    }
  ]
}
```
*Tip: Set `"blog_link": ""` if you do not have companion notes written yet.*

### 🚀 Projects (`data/en/projects.json`)
Controls the projects portfolio on `/projects/`:
```json
{
  "projects": [
    {
      "title": "Distributed Task Scheduler",
      "description": "High-throughput priority job orchestrator with leader election.",
      "tags": ["Go", "Raft", "Redis", "Docker"],
      "github": "https://github.com/brucewayne98/distributed-scheduler",
      "demo": "https://demo.example.com",
      "featured": true
    }
  ]
}
```

### 🛠️ Tech Stack & Skills (`data/en/tech.json`)
Controls the skill categories and icons using Devicons:
```json
{
  "categories": [
    {
      "name": "Backend & Distributed Systems",
      "skills": [
        { "name": "Go", "icon": "devicon-go-plain colored" },
        { "name": "Python", "icon": "devicon-python-plain colored" }
      ]
    }
  ]
}
```

### ✉️ Contact Page (`data/en/contact.json`)
Controls the copy, location, and form handler on `/contact/`:
```json
{
  "title": "Get in Touch",
  "subtitle": "Have an engineering challenge or want to talk distributed systems?",
  "location": "Bengaluru, India (IST / UTC+5:30)",
  "office_hours": "Monday – Friday: 09:00 - 18:00 IST",
  "form_action": "https://formspree.io/f/your-id"
}
```

---

## 2. Blog Posts (`content/en/blogs/`)

All blog posts are 100% Markdown files.

### Creating a New Blog Post
Create a new `.md` file in `content/en/blogs/my-post-title.md`:

```markdown
---
title: "Designing Event-Driven Microservices with Kafka"
date: 2024-11-04T10:00:00+05:30
draft: false
tags: ["kafka", "microservices", "go", "architecture"]
categories: ["architecture"]
description: "A comprehensive guide on event sourcing, outbox pattern, and Kafka partitioning."
# Optional: If this is an external publication (e.g., Medium, Substack)
# external_url: "https://medium.com/@username/your-article"
---

## Introduction

Your Markdown content goes here. You can write code blocks, lists, quotes, and diagrams:

```go
package main

import "fmt"

func main() {
    fmt.Println("Clean, fast microservice")
}
```

### Key Takeaways
- Event-driven patterns decouple synchronous RPC chains.
- The transactional outbox pattern prevents phantom writes.
```

---

## 3. Interactive Knowledge Graph & Blog Sync (`content/en/blogs/*.md`)

The Knowledge Graph is a visual, interactive mind-map built with React and `@xyflow/react`. In this architecture:
- **Single Source of Truth**: All topics and blogs live exclusively in `content/en/blogs/*.md`.
- **Knowledge Graph Sync**: Running `npm run sync:topics` (or building the graph) scans all `.md` files in `content/en/blogs/`, extracts the hierarchy, and generates `learning-graph/src/data/topics.json`.
- **1-Click Redirection**: Clicking **"Read More"** or **"Read Blog"** anywhere in the graph canvas, node cards, or search modal immediately navigates directly to the full blog post at `/blogs/<id>/`.
- **Privacy**: The graph metadata (`id`, `parent`, `order`, `category`, `color`, `difficulty`) is kept in Markdown frontmatter for the graph, but is automatically hidden from visitors on the public blog reading page.

### How Topics are Linked (The `parent` Field)
Topics form a hierarchical directed graph using the **`parent`** frontmatter field:

1. **Root Domain (Top Level)**: Set `parent: null` (or omit it).
   - *Examples*: `computer-science`, `ai`, `mathematics`.
2. **Child Topic (Level 1)**: Set `parent: <root-id>`.
   - *Example*: `deep-learning` with `parent: "ai"`.
3. **Sub-Topic (Drill-Down Levels 2+)**: Set `parent: <child-id>`.
   - *Example*: `transformers` with `parent: "deep-learning"`, and `attention-mechanism` with `parent: "transformers"`.

### Blog & Topic Frontmatter Schema

```markdown
---
title: "Self-Attention & Multi-Head Attention"
date: 2024-11-01T12:00:00+05:30
draft: false
tags: ["ai", "attention", "qkv", "transformers"]
summary: "Mathematical breakdown of Scaled Dot-Product Attention, queries, keys, and values."
description: "Mathematical breakdown of Scaled Dot-Product Attention, queries, keys, and values."

id: attention-mechanism           # Slug used for URL (/blogs/attention-mechanism/) and graph ID
parent: "transformers"           # ID of parent topic, or null for root domain
category: "ai"                   # Category domain: ai, cs, math, architecture, cloud, devops
order: 1                         # Sibling display order (1, 2, 3...)
color: "cyan"                    # Card theme: emerald, indigo, rose, cyan, amber, purple, blue
difficulty: "Advanced"           # Beginner, Intermediate, Advanced
---
```

### Supported Markdown Features (Both in Blogs & Graph)
- **Mermaid Diagrams**: Fenced blocks with `mermaid` render interactive SVG diagrams in both blog posts and previews.
- **LaTeX Math**: Inline `$E=mc^2$` and display blocks `$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$` rendered via KaTeX.
- **Tag Filtering**: All tags appear as clickable filter chips on the `/blogs/` directory page.

### Rebuilding the Knowledge Graph
```bash
npm run build:graph
```
*(Or simply run `npm run build`, which compiles Tailwind CSS, synchronizes topics, builds the Knowledge Graph, and generates Hugo output together!)*

## 4. Visual Content Creator Tool (`content-creator.html` & `start-creator.bat`)

To eliminate manual YAML editing and automatically save Markdown files directly with zero file navigation:

### 🚀 1-Click Direct Auto-Save (Recommended)
1. **Double-click [`start-creator.bat`](file:///d:/Books/brucewayne98.github.io/start-creator.bat)** in Windows Explorer (or run `npm run creator` in terminal).
2. It launches a local companion server and automatically opens `http://localhost:3333` in your default browser.
3. Enter your title, category, parent topic, tags, and body markdown.
4. Click **Save Blog Post**:
   - Automatically written directly to `content/en/blogs/<slug>.md`.
   - Automatically re-synchronizes the topic hierarchy and rebuilds the Knowledge Graph in the background!
   - **Zero file pickers, zero folder browsing, zero manual copying!**
5. The live parent selector automatically updates so your newly created topic can immediately be used as a parent for the next post.

### 🌟 Content Creator Features
- **Root Topic Banner**: Displays the category root node (e.g. `computer-science` for `cs`, `ai` for `ai`, `mathematics` for `math`) with a 1-click **"Link to Root"** button.
- **Hierarchical Parent Selector**: Shows the complete ancestry for each parent option (e.g. `ai | deep-learning | transformers`).
- **Live Preview with Math & Diagrams**: Real-time KaTeX rendering for math (`$inline$` and `$$block$$`) and Mermaid diagrams (flowcharts, `stateDiagram-v2`, mindmaps).
- **Two Simple Primary Actions**: **Save Blog Post** (1-click direct disk write + graph rebuild) and **Clear** (form reset).
- **Persistent Offline Fallback**: If opened as a standalone `file://` page without the local server, it connects to your workspace directory via the File System Access API and remembers the folder in IndexedDB across page reloads.

---

## 5. Local Development & Build Commands

Run these commands in the root of your project:

| Command | What It Does |
| :--- | :--- |
| `start-creator.bat` | 1-click launcher for the Visual Content Creator with automatic disk saving |
| `npm run creator` | Launches `creator-server.js` on `http://localhost:3333` |
| `npm run dev` | Starts Hugo development server with live reload at `http://localhost:1313` |
| `npm run build:css` | Compiles Tailwind CSS to `static/css/main.css` |
| `npm run build:graph` | Builds the interactive Knowledge Graph directly into `static/graph/` |
| `npm run build` | Full production build: compiles Tailwind CSS, builds Knowledge Graph, and runs `hugo --minify` |

---

## 6. Automated GitHub Pages Deployment

Your repository is equipped with GitHub Actions (`.github/workflows/deploy.yml`). When you push changes to `main`:
1. It automatically installs dependencies (`npm ci`).
2. Builds Tailwind CSS and the Knowledge Graph.
3. Compiles the Hugo site to `public/`.
4. Deploys directly to GitHub Pages.
