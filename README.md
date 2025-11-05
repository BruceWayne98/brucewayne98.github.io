# Hugo migration (partial)

This repository was previously a Jekyll site. I added a Hugo skeleton and converted your `_pages` and `_posts` into `content/pages` and `content/posts` so you can start using the `hugo-noir` theme.

Next steps to finish setup:

1. Add the theme as a git submodule (recommended):

   Open PowerShell in the repository root and run:

   git submodule add https://github.com/prxshetty/hugo-noir themes/hugo-noir

2. Install Hugo (if not installed) and run locally:

   # In PowerShell
   choco install hugo -confirm
   hugo server -D

3. Build the site:

   hugo -v

Notes:
- I left the original Jekyll files (`_config.yml`, `_posts`, etc.) in place so you can compare content. When you're ready, we can remove Jekyll artifacts or fully replace them.
- I created `config.yaml` which sets `theme: "hugo-noir"`. You may want to edit `baseURL`, `title`, and other params.

If you want, I can:
- Import all post bodies verbatim (I currently added placeholders for very large posts to keep the initial patch small).
- Add front matter tweaks (e.g., slugs, custom taxonomies) to match the theme's expectations.
- Add archetypes, layouts, and shortcodes if the theme requires them.
