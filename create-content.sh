#!/bin/bash

# Hugo Blog Helper Script
# Makes it easy to create new content

echo "🚀 Hugo Blog Content Creator"
echo "============================"
echo ""
echo "What would you like to create?"
echo "1) New blog post"
echo "2) New project"
echo "3) Start development server"
echo "4) Build site for production"
echo "5) Update theme"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
  1)
    read -p "Enter blog post filename (e.g., my-awesome-post): " filename
    hugo new content/en/blogs/${filename}.md
    echo "✅ Blog post created at: content/en/blogs/${filename}.md"
    echo "📝 Edit the file and set draft: false when ready to publish!"
    ;;
  2)
    read -p "Enter project filename (e.g., my-cool-project): " filename
    hugo new content/en/projects/${filename}.md
    echo "✅ Project created at: content/en/projects/${filename}.md"
    echo "📝 Edit the file and set draft: false when ready to publish!"
    ;;
  3)
    echo "🌐 Starting development server..."
    echo "📍 Your site will be available at http://localhost:1313"
    echo "Press Ctrl+C to stop the server"
    hugo server -D
    ;;
  4)
    echo "🔨 Building site for production..."
    hugo
    echo "✅ Site built successfully!"
    echo "📁 Your static site is in the 'public/' directory"
    ;;
  5)
    echo "⬆️  Updating theme..."
    git submodule update --remote --merge
    echo "✅ Theme updated successfully!"
    ;;
  *)
    echo "❌ Invalid choice. Please run the script again."
    ;;
esac
