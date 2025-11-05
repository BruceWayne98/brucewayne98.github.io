# Hugo Site - Setup Guide for New System

This guide helps you set up this Hugo site on a new computer.

## Prerequisites

1. **Install Hugo Extended** (v0.92.0 or newer)
   
   **macOS:**
   ```bash
   brew install hugo
   ```
   
   **Windows:**
   ```bash
   choco install hugo-extended
   ```
   
   **Linux:**
   ```bash
   snap install hugo
   ```

2. **Install Git**
   ```bash
   # Check if git is installed
   git --version
   ```

## Setup Steps

### 1. Extract the Site
```bash
# Extract the zip file to your desired location
unzip hugo-site-*.zip -d /path/to/new/location
cd /path/to/new/location
```

### 2. Initialize Git Repository (if needed)
```bash
git init
```

### 3. Install Theme Dependencies
```bash
# Update git submodules (this downloads the hugo-noir theme)
git submodule update --init --recursive
```

### 4. Start Development Server
```bash
hugo server -D
```

Your site will be available at: http://localhost:1313

## Customization

### Update Your Information

Edit these files with your details:

1. **`hugo.toml`** - Site configuration, social links
2. **`data/en/author.toml`** - Personal info, certifications, awards
3. **`data/en/tech.toml`** - Tech stack
4. **`data/en/experience.toml`** - Work experience
5. **`data/en/blogs.toml`** - Blog posts listing
6. **`data/en/projects.toml`** - Projects listing

### Add Profile Picture
Place your image at: `static/images/profile.jpg`

### Add Content

**Create a new blog post:**
```bash
hugo new content/en/blogs/my-post-name.md
```

**Create a new project:**
```bash
hugo new content/en/projects/my-project.md
```

## Common Commands

```bash
# Start development server
hugo server -D

# Build for production
hugo

# Create new blog post
hugo new content/en/blogs/post-name.md

# Create new project
hugo new content/en/projects/project-name.md

# Update theme
git submodule update --remote --merge
```

## Deployment

### Build Site
```bash
hugo
```
This creates static files in the `public/` directory.

### Deploy Options

1. **GitHub Pages**: Push `public/` folder to gh-pages branch
2. **Netlify**: Connect repo and deploy automatically
3. **Vercel**: Import repository
4. **Any Static Host**: Upload `public/` folder

## Troubleshooting

### Theme not loading?
```bash
git submodule update --init --recursive
```

### Port already in use?
```bash
hugo server -D -p 1314
```

### Clear cache
```bash
hugo --gc
```

## File Structure

```
Hugo-Site/
├── content/en/          # Your content
│   ├── blogs/          # Blog posts
│   └── projects/       # Projects
├── data/en/            # Data files
├── static/             # Static assets (images, etc.)
├── themes/hugo-noir/   # Theme (installed via submodule)
├── hugo.toml           # Main configuration
└── README.md           # Documentation
```

## Resources

- [Hugo Documentation](https://gohugo.io/documentation/)
- [Hugo Noir Theme](https://github.com/prxshetty/hugo-noir)
- [Markdown Guide](https://www.markdownguide.org/)

## Support

For theme-specific issues, visit: https://github.com/prxshetty/hugo-noir/issues

---

**Happy blogging! 🚀**
