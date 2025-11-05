# Quick Start Guide

## Start Your Blog in 3 Steps

### 1. Start the Server
```bash
hugo server -D
```
Then open http://localhost:1313 in your browser.

### 2. Create a New Blog Post
```bash
hugo new content/en/blogs/my-post.md
```
Edit the file, set `draft: false`, and save!

### 3. Customize Your Info
Edit these files:
- `hugo.toml` - Site settings and social links
- `data/en/author.toml` - Your personal info
- `data/en/tech.toml` - Your tech stack
- `data/en/experience.toml` - Your work experience

## Common Commands

```bash
# Create new blog post
hugo new content/en/blogs/post-name.md

# Create new project
hugo new content/en/projects/project-name.md

# Start development server
hugo server -D

# Build for production
hugo

# Update theme
git submodule update --remote --merge
```

## File Locations

- **Blog posts**: `content/en/blogs/`
- **Projects**: `content/en/projects/`
- **Static pages**: `content/en/` (about.md, contact.md, etc.)
- **Images**: `static/images/`
- **Configuration**: `hugo.toml`
- **Personal data**: `data/en/`

## Need Help?

See the full README.md for detailed instructions!
