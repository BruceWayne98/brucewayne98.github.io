---
layout: post
title: "Understanding Skip vs Cursor Pagination: A Deep Dive"
date: 2025-10-26
categories: [Database, Performance, Backend]
tags: [pagination, database-optimization, api-design]
---

When building APIs that return large datasets, pagination is crucial for performance and user experience. Two popular pagination approaches are Skip-based (Offset) and Cursor-based pagination. Let's explore both methods, their pros and cons, and when to use each.

## Skip-based Pagination

Skip-based pagination (also known as offset pagination) is the traditional approach where you specify:
- A page number (or offset)
- The number of items per page (limit)

Example SQL query:
```sql
SELECT * FROM posts
ORDER BY created_at DESC
LIMIT 10 OFFSET 20;
```

### Advantages
1. Simple to implement
2. Supports jumping to any page directly
3. Total count of items is easily available
4. Works well with simple ORDER BY clauses

### Disadvantages
1. Performance degrades with larger offsets
2. Inconsistent results with frequently updated data
3. Database must scan and discard offset rows
4. Memory usage increases with offset size

## Cursor-based Pagination

Cursor pagination uses a pointer (cursor) to determine where the next set of results should begin. The cursor is typically based on a unique, sequential value.

Example SQL query:
```sql
SELECT * FROM posts
WHERE created_at < $last_seen_timestamp
ORDER BY created_at DESC
LIMIT 10;
```

### Advantages
1. Consistent performance regardless of page depth
2. Works well with real-time data
3. More efficient for large datasets
4. Guarantees consistency with changing data

### Disadvantages
1. Cannot jump to arbitrary pages
2. More complex to implement
3. Requires a stable sort key
4. May need additional index support

## When to Use Each Method

### Choose Skip-based Pagination When:
- Your dataset is relatively small (< 1000 records)
- Users need to jump to specific pages
- You need to display total pages/items
- Data updates are infrequent

### Choose Cursor-based Pagination When:
- Dealing with large datasets
- Real-time data is involved
- Performance is critical
- Data changes frequently
- Building infinite scroll interfaces

## Implementation Tips

### Cursor Pagination Best Practices
1. Use compound cursors for ties:
```sql
WHERE (created_at, id) < ($last_timestamp, $last_id)
```

2. Base64 encode cursors to make them opaque:
```javascript
const cursor = Buffer.from(`${timestamp}_${id}`).toString('base64');
```

3. Include sort direction in cursor logic

### Skip Pagination Best Practices
1. Set reasonable limits on max page size
2. Cache counts when possible
3. Consider implementing both methods for different use cases

## Conclusion

While skip-based pagination is simpler to implement, cursor-based pagination is generally the better choice for modern, scalable applications. Consider your specific use case, data size, and user experience requirements when choosing between the two methods.

Remember that you can also implement both methods in your API, using cursor-based pagination for list views and infinite scroll, while keeping skip-based pagination for admin interfaces where jumping to specific pages is necessary.