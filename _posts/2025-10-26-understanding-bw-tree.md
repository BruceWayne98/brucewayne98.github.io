---
layout: single
title: "Understanding the BW-Tree: Cosmos DB’s Lock-Free Index"
date: 2025-10-26 20:00:00 +0530
categories: [database-systems, azure, data-structures]
tags: [cosmosdb, bw-tree, concurrency, indexing]
author_profile: true
excerpt: "A deep dive into the BW-Tree—the lock-free indexing structure behind Azure Cosmos DB, designed for modern multi-core and SSD-based systems."
header:
  overlay_color: "#000"
  overlay_filter: "0.35"
  overlay_image: /assets/images/bw-tree-architecture.jpg
---

When it comes to high-performance, globally distributed databases like **Azure Cosmos DB**, traditional data structures like B+ Trees start showing their age.  
To enable *lock-free, latch-free, and write-optimized indexing*, Microsoft engineers developed the **Bw-Tree (B-Link Tree with Write-optimized structure)** — a next-generation concurrency-aware tree design [web:144][web:151][web:150].

---

### What Is a Bw-Tree?

The **Bw-Tree** (short for *B-link Write-optimized Tree*) is a **lock-free and latch-free variant of the B-Tree**.  
It’s specifically built for **multi-core CPUs** and **solid-state drives (SSDs)**, leveraging hardware characteristics like atomic operations and CPU cache locality to deliver high throughput and minimal contention.

Key architectural goals:
- Support concurrent reads and writes without locking
- Avoid random in-place updates (critical for SSDs)
- Exploit atomic compare-and-swap (CAS) operations for synchronization
- Maximize CPU cache efficiency [web:144][web:154][web:148]

---

### Core Concepts of the Bw-Tree

The Bw-Tree achieves concurrency and efficiency through three key mechanisms:

#### 1. **Mapping Table (Indirection Layer)**
Instead of hard pointers, every node has a **logical Node ID**.
A global **mapping table** translates these logical IDs to physical memory addresses.

Atomic **Compare-and-Swap (CAS)** operations allow the mapping table to be updated without locks.  
This design enables “installing” new versions of nodes without disturbing concurrent threads [web:148][web:151].

#### 2. **Delta Chains**
Rather than modifying a page in-place, updates (inserts, deletes, splits) are appended as small **delta records**.

Each Bw-Tree node consists of:
- A **base node** (immutable snapshot of the node)
- A **chain of delta records** describing recent changes

This ensures that writes are *append-only*, enabling **lock-free updates** and fast recovery from logs [web:148][web:154].

When a chain becomes too long, background consolidation threads merge delta records into a new base page — similar to compaction in LSM trees but at node granularity.

#### 3. **Log-Structured Storage**
All updates are persisted as **sequential log entries**, minimizing random write amplification and improving SSD durability.  
Writes and checkpoint recovery are based on append-only logs, maintaining high throughput even under heavy concurrent insert workloads [web:150][web:153].

---

### How Cosmos DB Uses the Bw-Tree

Azure Cosmos DB’s indexing engine builds on an **extended Bw-Tree** to maintain its schema-agnostic and multi-model nature:

- **Automatic Indexing:** Each document’s JSON path and properties are converted into index terms (inverted and forward maps).  
- **Inverted Index Structure:** Keys represent (path + value) pairs, while values store document IDs in compressed bitmaps.  
- **Blind Incremental Updates:** Cosmos DB performs write operations to the Bw-Tree **without any read I/O**, merging updates asynchronously [web:150][web:147][web:146].
- **Consistency via Delta Replication:** Delta records are asynchronously replicated to secondaries, offering consistency levels like *Session*, *Bounded Staleness*, and *Strong*.

This design enables Cosmos DB to handle **billions of documents**, maintaining real-time query performance and low-latency global writes — all powered by its Bw-Tree index.

---

### Advantages of the Bw-Tree

| Advantage | Description |
|------------|-------------|
| **Lock-Free Concurrency** | Readers and writers operate without blocking each other |
| **SSD-Optimized Writes** | Sequential append-only updates reduce write amplification |
| **Cache Locality** | Avoiding pointer chasing and latch contention improves CPU utilization |
| **Batched Node Consolidation** | Maintains fast reads while cleaning delta chains incrementally |
| **Crash Recovery** | Log-based persistence minimizes rebuild times after node failures |

---

### Summary

The **Bw-Tree** reimagines classic B-Trees for the modern hardware era — **multi-core CPUs, high concurrency, and SSD storage**.  
By combining **indirection via mapping tables**, **delta chains for atomic updates**, and **log-structured persistence**, it achieves **near lock-free parallelism**.  

Azure Cosmos DB extends this concept further, adapting it to JSON document indexing, delivering unmatched scalability and latency.

---

**References**
- Levandoski et al., *The Bw-Tree: A B-Tree for New Hardware Platforms*, VLDB [web:144][web:151]
- Sudipta Sengupta, *The Bw-Tree Key-Value Store and Its Applications* [web:145]
- Microsoft Azure Cosmos DB Internals, Engineering Notes [web:150][web:146]
