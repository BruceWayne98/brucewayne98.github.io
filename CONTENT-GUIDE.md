# Content Creation Templates

## Blog Post Template

```markdown
---
title: "Your Post Title"
date: 2024-11-04T10:00:00-08:00
draft: false
tags: ["tag1", "tag2", "tag3"]
categories: ["category"]
description: "A brief description of your post for SEO and previews."
---

# Your Main Heading

Your introduction paragraph goes here...

## Section 1

Content for section 1...

### Code Example

\`\`\`javascript
// Your code here
const example = "Hello World";
console.log(example);
\`\`\`

## Section 2

More content...

### Lists

- Item 1
- Item 2
- Item 3

### Numbered Lists

1. First item
2. Second item
3. Third item

## Conclusion

Your conclusion...
```

## Project Template

```markdown
---
title: "Project Name"
date: 2024-11-04T10:00:00-08:00
draft: false
tags: ["tech1", "tech2"]
description: "Brief project description"
github: "https://github.com/username/repo"  # Optional
demo: "https://demo-url.com"  # Optional
---

# Project Name

A comprehensive description of your project.

## Features

- Feature 1
- Feature 2
- Feature 3

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Hosting**: AWS

## Challenges & Solutions

Describe the main challenges you faced and how you solved them.

## Key Achievements

- Achievement 1
- Achievement 2
- Achievement 3

## What I Learned

Share your learning experience from this project.
```

## Papers Entry Template

To add a paper to your Papers page, edit `data/en/papers.toml`:

```toml
[[papers]]
title = "Paper Title"
paper_link = "https://arxiv.org/abs/xxxx.xxxxx"
blog_link = "/blogs/my-notes-on-paper"  # Leave empty "" if no blog post
summary = "Brief description of what the paper is about and why it's interesting."
authors = "Author Names"
year = "2024"
```

**Note**: 
- `blog_link` can be internal (`/blogs/...`) or external (`https://medium.com/...`)
- Leave `blog_link = ""` if you don't have notes/blog post yet
- The Papers page displays **5 papers per page** with automatic pagination
- Navigate using Previous/Next buttons or page numbers at the bottom
- To change items per page, edit `$itemsPerPage` in `layouts/_default/papers.html`

## Static Page Template

```markdown
---
title: "Page Title"
date: 2024-11-04T10:00:00-08:00
draft: false
layout: "single"
---

# Page Heading

Your page content goes here...

## Section

More content...
```

## About Page Template (with Certifications & Awards)

```markdown
---
title: "About Me"
date: 2024-11-04T10:00:00-08:00
draft: false
layout: "single"
---

# About Me

Your introduction and background...

## What I Do

Your specializations and skills...

## My Journey

Your career story...

## Beyond Code

Your interests outside of coding...

---

# Certifications

### Certification Name
**Issuing Organization** | *Year*

Brief description of what this certification validates or demonstrates.

### Another Certification
**Issuing Organization** | *Year*

Description of the certification and skills demonstrated.

---

# Honors and Awards

### Award Name
**Organization/Event** | *Year*

Description of the achievement and what you were recognized for.

### Another Award
**Organization/Event** | *Year*

Description of the recognition and impact.

---

## Let's Connect

Your call to action for connecting...
```

## Markdown Tips

### Images
```markdown
![Alt text](/images/image-name.jpg)
```

### Links
```markdown
[Link text](https://example.com)
```

### Bold and Italic
```markdown
**bold text**
*italic text*
***bold and italic***
```

### Blockquotes
```markdown
> This is a blockquote
> It can span multiple lines
```

### Tables
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |
```

### Horizontal Rule
```markdown
---
```

### Inline Code
```markdown
Use `backticks` for inline code
```

### Code Blocks with Syntax Highlighting
````markdown
```python
def hello_world():
    print("Hello, World!")
```

```javascript
function helloWorld() {
    console.log("Hello, World!");
}
```

```go
func main() {
    fmt.Println("Hello, World!")
}
```
````

## Front Matter Fields Explained

### Common Fields

- `title`: The page/post title (required)
- `date`: Publication date in ISO 8601 format (required)
- `draft`: Set to `false` to publish, `true` to keep as draft
- `description`: SEO description and preview text
- `tags`: Array of tags for categorization
- `categories`: Array of categories

### Blog-Specific Fields

- `tags`: Help readers find related content
- `categories`: Organize posts into broader topics

### Project-Specific Fields

- `github`: Link to GitHub repository
- `demo`: Link to live demo
- `featured`: Set to `true` to feature on homepage

## SEO Best Practices

1. Write descriptive titles (50-60 characters)
2. Add meta descriptions (150-160 characters)
3. Use relevant tags and categories
4. Include images with alt text
5. Use proper heading hierarchy (H1 → H2 → H3)
6. Write clear, concise URLs (use lowercase, hyphens)

## Content Tips

1. **Start strong**: Hook readers in the first paragraph
2. **Use headings**: Break content into scannable sections
3. **Add examples**: Code snippets, screenshots, diagrams
4. **Be concise**: Get to the point quickly
5. **Edit ruthlessly**: Remove unnecessary words
6. **Add value**: Share insights, not just facts
7. **End with action**: Call to action or conclusion

## Publishing Checklist

- [ ] Set `draft: false`
- [ ] Add descriptive title
- [ ] Include meta description
- [ ] Add relevant tags
- [ ] Include images (if applicable)
- [ ] Proofread for typos
- [ ] Check code examples
- [ ] Preview locally with `hugo server -D`
- [ ] Test on mobile view
- [ ] Verify all links work
