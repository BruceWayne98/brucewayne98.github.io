# Hugo Blog with Noir Theme

A beautiful, minimalistic blog built with Hugo and the hugo-noir theme. This site features dark/light mode, responsive design, and a clean aesthetic perfect for blogging and showcasing your work.

## 🚀 Quick Start

### Prerequisites

- Hugo Extended (v0.92.0 or newer) - [Install Hugo](https://gohugo.io/installation/)
- Git

### Installation

1. **Clone this repository**
   ```bash
   git clone <your-repo-url>
   cd Hugo-Site
   ```

2. **Initialize the theme submodule**
   ```bash
   git submodule update --init --recursive
   ```

3. **Start the development server**
   ```bash
   hugo server -D
   ```

4. **Open your browser**
   Navigate to `http://localhost:1313` to see your site!

## 📝 Adding Content

This site uses a **data-driven approach** for blogs, projects, and papers. Instead of creating individual markdown files, you simply edit TOML data files. Each page displays **5 items per page** with automatic pagination.

### Adding a Blog Post

Edit `data/en/blogs.toml` and add a new entry to the `[[blogs]]` array:

```toml
[[blogs]]
title = "My New Blog Post"
date = "November 4, 2024"
link = "https://medium.com/@yourusername/your-post"  # External link (Medium, Dev.to, etc.)
# OR
link = "/blogs/my-post"  # Internal link to content/en/blogs/my-post.md
summary = "A brief description of what this blog post is about. Keep it concise and engaging."
tags = ["Python", "Machine Learning", "Tutorial"]
```

**External vs Internal Blogs:**
- **External**: Point to your Medium, Dev.to, or Hashnode posts using full URLs
- **Internal**: Create a markdown file in `content/en/blogs/` and link to it with `/blogs/filename`

The blogs page automatically paginates with 5 posts per page. No additional configuration needed!

### Adding a Project

Edit `data/en/projects.toml` and add a new project:

```toml
[[projects]]
title = "My Awesome Project"
description = "A comprehensive description of what this project does, its purpose, and its impact."
link = "https://github.com/yourusername/project"  # GitHub, live demo, or project page
image = "/images/projects/my-project.jpg"  # Add image to static/images/projects/
tech = "Python,React,Docker,PostgreSQL"  # Comma-separated technologies
```

**Adding Project Images:**
1. Add your project screenshot/banner to `static/images/projects/`
2. Reference it in the `image` field as `/images/projects/filename.jpg`
3. Recommended size: 1200x675px (16:9 aspect ratio)

Projects display 5 per page with automatic pagination.

### Adding a Research Paper

Edit `data/en/papers.toml` and add a new paper entry:

```toml
[[papers]]
title = "Paper Title: A Comprehensive Study"
authors = "First Author, Second Author, et al."
year = "2024"
paper_link = "https://arxiv.org/abs/xxxx.xxxxx"  # Link to the paper (arXiv, journal, etc.)
blog_link = "/papers/my-paper-notes"  # Optional: Link to your notes/summary
summary = "A concise summary of the paper's contributions, methodology, and key findings. Keep it informative but brief."
```

**Adding Paper Notes (Optional):**
If you want to write your own notes/summary about a paper:
1. Create `content/en/papers/my-paper-notes.md`
2. Write your detailed notes in markdown
3. Link to it in the `blog_link` field

Papers display 5 per page with automatic pagination.

### Updating Your Personal Information

#### About Page (`data/en/author.toml`)

Edit your bio, certifications, honors, and voluntary work:

```toml
[author]
name = "Your Name"
location = "Your City, Country"
description = """
Your bio here. You can write multiple lines.
Talk about your background, interests, and what you do.
"""
profile_image = "/images/profile.jpg"

[[certifications]]
title = "Certification Name"
issuer = "Issuing Organization"
date = "Month Year"
link = "https://credential-url.com"  # Optional

[[honors]]
title = "Award or Honor Name"
issuer = "Awarding Organization"
date = "Month Year"
description = "Brief description of the achievement"

[[voluntary]]
role = "Volunteer Role"
organization = "Organization Name"
organization_link = "https://org-website.com"  # Optional
period = "Jan 2020 - Present"
description = "What you did as a volunteer"
```

#### Work Experience (`data/en/experience.toml`)

Add or update your work experience:

```toml
[[experience]]
role = "Senior Software Engineer"
company = "Company Name"
company_link = "https://company.com"  # Optional
period = "January 2020 - Present"
country = "United States"
responsibilities = [
  "Led development of key features that improved user engagement by 40%",
  "Mentored junior developers and conducted code reviews",
  "Architected scalable microservices using Docker and Kubernetes"
]
technologies = ["Python", "React", "AWS", "PostgreSQL", "Docker"]
```

#### Tech Stack Carousel (`data/en/tech.toml`)

Update the technologies displayed on your homepage:

```toml
row1 = [
  { icon = "devicon-python-plain", name = "Python" },
  { icon = "devicon-javascript-plain", name = "JavaScript" },
  { icon = "devicon-react-original", name = "React" },
  { icon = "devicon-nodejs-plain", name = "Node.js" }
]

row2 = [
  { icon = "devicon-docker-plain", name = "Docker" },
  { icon = "devicon-postgresql-plain", name = "PostgreSQL" },
  { icon = "devicon-amazonwebservices-original", name = "AWS" },
  { icon = "devicon-git-plain", name = "Git" }
]
```

Find icon class names at [devicon.dev](https://devicon.dev/).

### Modifying Static Pages

To edit the homepage introduction or page descriptions, edit the markdown files in `content/en/`:

- `content/en/_index.md` - Homepage content
- `content/en/about.md` - About page header
- `content/en/blogs/_index.md` - Blogs page header
- `content/en/projects/_index.md` - Projects page header
- `content/en/papers.md` - Papers page header
- `content/en/experience.md` - Experience page header
- `content/en/contact.md` - Contact page

**Note**: The actual content for About, Blogs, Projects, Papers, and Experience comes from data files, but you can edit the page headers/descriptions in these markdown files.

## ⚙️ Configuration

### Site Configuration (`hugo.toml`)

Edit the main site settings:

```toml
baseURL = "https://yourdomain.com/"
title = "Your Blog Title"
languageCode = "en-us"
theme = "hugo-noir"

[params]
  name = "Your Name"
  location = "Your City, Country"
  description = "Brief description about yourself"
  
  # Social links (used in Contact page)
  github_username = "yourusername"
  twitter_username = "yourusername"
  linkedin_username = "yourusername"
  discord = "yourdiscordhandle"
  email = "your.email@example.com"
```

### Navigation Menu (`hugo.toml`)

Customize the header menu:

```toml
[languages.en.menu]
  [[languages.en.menu.main]]
    name = "Home"
    pageRef = "/"
    weight = 1
  
  [[languages.en.menu.main]]
    name = "About"
    pageRef = "/about"
    weight = 2
  
  # Add more menu items...
  # Lower weight = appears first
```

### Contact Page Social Links

The contact page displays cards for your social profiles. Configure in `hugo.toml` under `[params]`:

```toml
[params]
  email = "your.email@example.com"
  github_username = "yourusername"  # Just username, not full URL
  twitter_username = "yourusername"
  linkedin_username = "yourusername"
  discord = "yourdiscordhandle"
```

The theme automatically creates clickable cards for each configured social link.

## 🎨 Customization

### Adding Your Profile Picture

1. Add your profile picture to `static/images/profile.jpg`
2. Update the path in `hugo.toml` and `data/en/author.toml`

### Custom CSS

Create `assets/css/custom.css` to add your own styles:

```css
/* Your custom styles */
.custom-class {
    color: #your-color;
}
```

## 📁 Project Structure

```
Hugo-Site/
├── content/
│   └── en/              # English content
│       ├── _index.md    # Homepage
│       ├── about.md     # About page header
│       ├── contact.md   # Contact page
│       ├── experience.md # Experience page header
│       ├── papers.md    # Papers page header
│       ├── blogs/       # Blog post headers (actual content in data/en/blogs.toml)
│       │   └── _index.md
│       ├── projects/    # Project headers (actual content in data/en/projects.toml)
│       │   └── _index.md
│       └── papers/      # Optional: Individual paper notes (markdown files)
├── data/
│   └── en/              # Site data (THIS IS WHERE YOU ADD CONTENT!)
│       ├── author.toml  # Personal info, certifications, honors, volunteer work
│       ├── tech.toml    # Tech stack carousel
│       ├── experience.toml # Work experience
│       ├── blogs.toml   # ⭐ Blog posts listing (5 per page)
│       ├── projects.toml # ⭐ Projects listing (5 per page)
│       └── papers.toml  # ⭐ Research papers listing (5 per page)
├── layouts/
│   └── _default/        # Custom page layouts
│       ├── blogs.html   # Blogs page with pagination
│       ├── projects.html # Projects page with pagination
│       └── papers.html  # Papers page with pagination
├── static/              # Static assets
│   ├── images/          # Images
│   │   ├── profile.jpg  # Your profile picture
│   │   └── projects/    # Project screenshots
│   ├── css/            # Custom CSS
│   └── js/             # Custom JavaScript
├── themes/
│   └── hugo-noir/      # Theme files (don't edit directly)
└── hugo.toml           # Site configuration
```

### Key Directories Explained

- **`data/en/`** - Main content files! Edit TOML files here to add blogs, projects, papers
- **`content/en/`** - Page headers and descriptions (markdown)
- **`layouts/_default/`** - Custom layouts with pagination (blogs, projects, papers)
- **`static/images/`** - All images (profile, project screenshots, etc.)
- **`hugo.toml`** - Site configuration, menu, social links

## 🚢 Deployment

### Build Your Site

```bash
hugo
```

This generates your static site in the `public/` directory.

### Deploy Options

- **GitHub Pages**: Push to GitHub and enable GitHub Pages
- **Netlify**: Connect your repo and deploy automatically
- **Vercel**: Import your repository and deploy
- **AWS S3**: Upload the `public/` folder to S3

### Example: Deploy to GitHub Pages

1. Create a GitHub repository
2. Add this to `hugo.toml`:
   ```toml
   baseURL = "https://yourusername.github.io/repo-name/"
   ```
3. Build and push:
   ```bash
   hugo
   git add .
   git commit -m "Deploy site"
   git push origin main
   ```

## 📚 Resources

- [Hugo Documentation](https://gohugo.io/documentation/)
- [Hugo Noir Theme](https://github.com/prxshetty/hugo-noir)
- [Markdown Guide](https://www.markdownguide.org/)
- [Devicon Icons](https://devicon.dev/)

## 🎯 Tips for Content Creation

### Quick Content Update Workflow

1. **Add a blog post**: Edit `data/en/blogs.toml` → Add `[[blogs]]` entry → Save
2. **Add a project**: Edit `data/en/projects.toml` → Add `[[projects]]` entry → Add image to `static/images/projects/` → Save
3. **Add a paper**: Edit `data/en/papers.toml` → Add `[[papers]]` entry → Save
4. **Preview**: Run `hugo server -D` and check at `http://localhost:1313`

### Pagination

All listing pages (Blogs, Projects, Papers) automatically show **5 items per page**:
- Navigation buttons (Previous/Next) appear at the bottom
- Page numbers are shown when there are more than 3 pages
- Smooth scrolling to top on page change
- To change items per page, edit `itemsPerPage` in the corresponding layout file:
  - `layouts/_default/blogs.html` (line 79)
  - `layouts/_default/projects.html` (line 137)
  - `layouts/_default/papers.html` (line 79)

### Best Practices

1. **Keep summaries concise**: 2-3 sentences that capture the essence
2. **Use high-quality images**: For projects, use 1200x675px (16:9) screenshots
3. **Link to external content**: Point blogs to Medium/Dev.to, papers to arXiv/journals
4. **Add relevant tags**: Help readers find related content (blogs only)
5. **Update regularly**: Keep your tech stack, experience, and content current
6. **Test locally**: Always run `hugo server -D` before deploying
7. **Optimize images**: Compress images before adding to `static/images/`

### Data File Locations Cheat Sheet

| Content Type | Data File | Purpose |
|-------------|-----------|---------|
| Blog Posts | `data/en/blogs.toml` | List of blog posts (internal or external links) |
| Projects | `data/en/projects.toml` | Portfolio projects with images |
| Papers | `data/en/papers.toml` | Research papers you've read |
| About Info | `data/en/author.toml` | Bio, certifications, honors, volunteer work |
| Experience | `data/en/experience.toml` | Work history and responsibilities |
| Tech Stack | `data/en/tech.toml` | Technologies for homepage carousel |
| Social Links | `hugo.toml` | GitHub, Twitter, LinkedIn, Email, Discord |

## 🐛 Troubleshooting

### Site not loading after changes?

```bash
# Clear Hugo cache
hugo --gc
# Restart server
hugo server -D
```

### Theme not working?

```bash
# Update theme
git submodule update --remote --merge
```

### Port already in use?

```bash
# Use a different port
hugo server -D -p 1314
```

## 📄 License

This project uses the Hugo Noir theme, which is licensed under the MIT License.

## 🤝 Contributing

Feel free to customize this blog for your needs! If you make improvements, consider contributing back to the [hugo-noir theme](https://github.com/prxshetty/hugo-noir).

---

**Happy Blogging! 🎉**

For questions or issues, please open an issue on the theme repository or refer to the Hugo documentation.
