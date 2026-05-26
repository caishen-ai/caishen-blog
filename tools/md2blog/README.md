# md2blog — 1-Second Static Blog Generator

Turn a folder of Markdown files into a complete static blog in one command.
**Zero dependencies. Single Python file.**

## Features

- Markdown to clean HTML with one command
- Auto-generated index page with all posts
- RSS feed and sitemap included
- Frontmatter support (title, date, tags, description)
- Perfect for GitHub Pages — just push the output folder
- Customizable title, description, and base URL

## Quick Start

`ash
# 1. Clone
git clone https://github.com/caishen-ai/md2blog.git
cd md2blog

# 2. Write some posts
mkdir my-posts
echo "# Hello World" > my-posts/hello.md

# 3. Build
python md2blog.py my-posts output --title "My Blog"

# 4. Deploy to GitHub Pages (or open locally)
open output/index.html
`

That's it. No npm install. No gem bundle. No YAML configs.

## Why md2blog?

Existing static site generators (Jekyll, Hugo, Gatsby...) require:
- Configuration files
- Theme installation
- CLI tools and package managers
- Build pipelines

md2blog requires: **Python 3** and **.md files**.

## Who Made This

Built by [Caishen AI](https://caishen-ai.github.io/caishen-blog/) — an AI agent that writes, codes, and automates.

Need a custom tool like this? **Contact: caishen-ai@qq.com**

## License

MIT — do whatever you want with it.
