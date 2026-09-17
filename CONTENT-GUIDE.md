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
| **About Page Story, Focus Areas & Narrative** | `data/en/about.json` | JSON |
| **Contact Page Text, Form endpoint & Availability** | `data/en/contact.json` | JSON |
| **Blog Articles (Articles & Tutorials)** | `content/en/blogs/*.md` | Markdown (`.md`) |
| **Knowledge Graph Topics & Notes** | `learning-graph/src/content/**/*.md` | Markdown (`.md`) |

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

### 📖 About Page (`data/en/about.json`)
Controls your background story, narrative, and focus areas on `/about/`:
```json
{
  "title": "Engineering at Scale & Crafting Resilient Systems",
  "intro": "I am a backend and distributed systems engineer...",
  "story_paragraphs": [
    "Paragraph 1 about your background...",
    "Paragraph 2 about your journey..."
  ],
  "focus_areas": [
    {
      "title": "Distributed Systems",
      "description": "Consensus algorithms, event-driven architecture, and zero-downtime deployments."
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

## 3. Interactive Knowledge Graph (`learning-graph/src/content/`)

The Knowledge Graph is a visual interactive mind-map of CS, Cloud, and Engineering topics. Every node is backed by a Markdown file.

### Adding or Updating a Topic Note
Topic guides live in `learning-graph/src/content/<category>/<topic-slug>.md`.

Categories include:
- `cs/`: Computer Science & Systems (e.g., `gpu-memory-hierarchy.md`)
- `cloud/`: Cloud Architecture & AWS/GCP
- `devops/`: CI/CD, Containers & Infrastructure
- `ai-ml/`: Machine Learning & LLM Systems
- `architecture/`: Distributed Systems & System Design

Example topic file:
```markdown
# GPU Memory Hierarchy

Comprehensive guide to High Bandwidth Memory (HBM), Shared Memory, Registers, and coalesced access.

## Architecture Overview
- **Registers**: Fastest storage, per thread
- **Shared Memory / L1**: On-chip memory shared by threads in a Thread Block
- **L2 Cache**: Shared across all Streaming Multiprocessors (SMs)
- **HBM / GDDR**: High-capacity global device memory
```

### Rebuilding the Knowledge Graph
Whenever you add or modify topics in `learning-graph/`:
```bash
npm run build:graph
```
*(Or simply run `npm run build`, which compiles both Tailwind CSS, the Knowledge Graph, and Hugo together!)*

---

## 4. Local Development & Build Commands

Run these commands in the root of your project:

| Command | What It Does |
| :--- | :--- |
| `npm run dev` | Starts Hugo development server with live reload at `http://localhost:1313` |
| `npm run build:css` | Compiles Tailwind CSS to `static/css/main.css` |
| `npm run build:graph` | Builds the interactive Knowledge Graph directly into `static/graph/` |
| `npm run build` | Full production build: compiles Tailwind CSS, builds the Knowledge Graph, and executes `hugo --minify` |

---

## 5. Automated GitHub Pages Deployment

Your repository is equipped with GitHub Actions (`.github/workflows/deploy.yml`). When you push changes to `main`:
1. It automatically installs dependencies (`npm ci`).
2. Builds Tailwind CSS and the Knowledge Graph.
3. Compiles the Hugo site to `public/`.
4. Deploys directly to GitHub Pages.
