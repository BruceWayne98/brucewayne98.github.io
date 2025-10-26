---
title: "Skip vs Cursor Pagination: Practical Database Paging Strategies"
date: 2025-10-26T20:52:00+05:30
last_modified_at: 2025-10-26T20:52:00+05:30
categories:
  - Database
  - Backend
  - Performance
  - API Design
tags:
  - Pagination
  - SQL
  - Offset
  - Cursor
  - Scalability
toc: true
toc_label: "Table of Contents"
toc_icon: "list"
header:
  overlay_color: "#000" 
  overlay_filter: "0.5"
excerpt: "A detailed technical guide comparing skip (offset/limit) vs cursor (keyset) pagination in databases, their implementation, performance, and best practices for scalable software systems."
---

## Introduction

Efficient pagination is critical in databases and APIs to handle large result sets. The two dominant strategies—**skip (offset/limit)** and **cursor (keyset)** pagination—differ in performance, consistency, and scalability. Understanding their trade-offs is vital for scalable backend and database architecture.

---

## Skip (Offset/Limit) Pagination

### Concept
Skip pagination uses an OFFSET to skip rows and a LIMIT (or pageSize) to cap results. For example:

```sql
SELECT * FROM messages ORDER BY created_at DESC LIMIT 20 OFFSET 100;
```
This fetches 20 rows, skipping the first 100.

### Pros
- **Simple and intuitive** for users and developers
- **Works everywhere**: Supported in all SQL/NoSQL databases and REST APIs
- **Jump to any page**: Easy direct access (e.g., “Page 50”)

### Cons
- **Poor performance for large offsets**: DB must scan and discard many rows[^1][^2][^57][^69]
- **Prone to inconsistent pages**: Insertions/deletions cause duplicates or missing data
- **Expensive counting**: Total page counts with COUNT(*) are slow on huge tables

### Recommended Use Cases
- Admin panels, reporting tools
- Small-to-medium, mostly-static datasets
- Any UI where direct page access (not just next/prev) is needed

---

## Cursor (Keyset) Pagination

### Concept
Cursor pagination uses a column value (the *cursor*) as a starting point for fetching the next chunk of results—often using a unique key or composite index[^65][^63][^83].

```sql
-- Fetch first 10 ordered by id
SELECT * FROM users ORDER BY id ASC LIMIT 10;

-- Next page: Get records after last seen id
SELECT * FROM users WHERE id > {last_id} ORDER BY id ASC LIMIT 10;
```

For composite sorting:
```sql
SELECT * FROM events WHERE (created_at, id) > ('2025-10-20', 42) ORDER BY created_at, id LIMIT 10;
```

The API encodes the last ID or composite key as an opaque *cursor*, e.g., base64-encoded JSON or string[^82][^87][^85].

### Pros
- **Consistent paging**: Prevents missing or repeating rows even as data changes
- **O(1) performance**: Uses indexed seek, not full scans
- **Scalable**: No degradation with deep pages/large tables
- **Modern API and feed support**: Used by social platforms, GraphQL and REST APIs

### Cons
- **No random page jumps**: Can only go next/previous
- **Harder to implement**: Must handle cursor generation and encoding
- **Requires sort on unique keys** (e.g., id or timestamp+id)

### Recommended Use Cases
- High-traffic APIs, large data sets, infinite scroll UIs
- Real-time feeds and event streams
- Scenarios demanding consistency during concurrent writes

---

## Comparison Table

| Property            | Skip/Offset           | Cursor/Keyset          |
|---------------------|----------------------|------------------------|
| **Performance**     | Degrades with OFFSET | Constant, index seek   |
| **Consistency**     | Prone to drift       | Stable, no duplicates  |
| **Page Jumping**    | Yes                  | No                     |
| **Simplicity**      | Easy                 | Moderate               |
| **API Fit**         | REST/Paged UI        | REST/GraphQL/Feeds     |
| **Requirements**    | Any sorting          | Stable, unique index   |

---

## Example: Real-World API Cursor

A typical API response with cursor pagination:

```json
{
  "data": [ ... ],
  "next_cursor": "eyJpZCI6MTAwMCwidHMiOiIyMDI1LTEwLTI1IdeifQ=="
}
```
*The cursor above is base64-encoded ({"id":1000,"ts":"2025-10-25"}).*

Next request:
```
GET /api/messages?cursor=eyJpZCI6MTAwMCwidHMiOiIyMDI1LTEwLTI1IdeifQ==&limit=10
```

---

## Best Practices

- Use **skip/offset** for admin tools and random-access UIs on small-to-medium tables
- Favor **cursor/keyset** for high-scale, append-only, or frequently-updated data
- For cursor pagination: always index your cursor columns
- Base64 encode cursors for API opacity

---

## References

[^1]: blog.thnkandgrow.com/understanding-the-limits-of-limit-and-offset-for-large-datasets/
[^2]: dev.to/jacktt/comparing-limit-offset-and-cursor-pagination-1n81
[^57]: pingcap.com/article/limit-offset-pagination-vs-cursor-pagination-in-mysql/
[^63]: www.merge.dev/blog/keyset-pagination
[^65]: blog.sequinstream.com/keyset-cursors-not-offsets-for-postgres-pagination/
[^69]: cedardb.com/blog/pagination/
[^82]: stackoverflow.com/questions/28389893/why-is-it-a-common-practice-to-encode-pagination-cursors-or-id-values-as-string
[^83]: readyset.io/blog/optimizing-sql-pagination-in-postgres
[^85]: graphql-ruby.org/pagination/cursors.html
[^87]: docs.immutable.com/x/api-pagination/

---

For more in-depth database internals and API best practices, see related posts in the Performance and Database categories.