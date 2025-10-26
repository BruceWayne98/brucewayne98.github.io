---
layout: home
title: My Blog
---

<h1>Welcome to My Blog</h1>
<p>This is my personal blog where I share my thoughts and experiences.</p>

<ul>
{% for post in site.posts %}
  <li>
    <a href="{{ post.url }}">{{ post.title }}</a>
    <span>{{ post.date | date: "%B %d, %Y" }}</span>
  </li>
{% endfor %}
</ul>
