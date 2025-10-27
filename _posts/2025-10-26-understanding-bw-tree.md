---
title: "The Bw-Tree: A B-tree for New Hardware Platforms"
excerpt: "A comprehensive technical analysis of the Bw-Tree research paper from ICDE 2013, which introduces a latch-free B-tree optimized for multi-core processors and flash storage through delta updates, mapping tables, and log-structured storage."
categories:
  - Database Systems
  - Index Structures
tags:
  - Bw-Tree
  - Cosmos DB
toc: true
toc_label: "Table of Contents"
toc_icon: "cog"
author_profile: true
---

## Overview

**The Bw-Tree: A B-tree for New Hardware Platforms** is a groundbreaking research paper published at IEEE ICDE 2013 by Justin J. Levandoski, David B. Lomet, and Sudipta Sengupta from Microsoft Research. The paper presents a revolutionary reimagination of the classic B-tree data structure optimized for modern hardware architectures.

The Bw-tree achieves exceptional performance through a **latch-free approach** that exploits processor caches of multi-core chips and a **log-structured storage layer** optimized for flash memory. The system is currently deployed in production at Microsoft in SQL Server Hekaton, Azure DocumentDB, and Bing ObjectStore, demonstrating its real-world viability.

**Paper Citation:**
```
Levandoski, J. J., Lomet, D. B., & Sengupta, S. (2013). 
The Bw-Tree: A B-tree for new hardware platforms. 
In 2013 IEEE 29th International Conference on Data Engineering (ICDE) (pp. 302-313). IEEE.
```

**Key Achievement**: The Bw-tree delivers **18.7x speedup** over BerkeleyDB and **4.4x speedup** over latch-free skip lists in memory-resident workloads, while maintaining excellent cache efficiency (90% L1/L2 hit rates).

---

## Motivation: The New Hardware Environment

### Hardware Trends Reshaping Database Design

Since the 1970s, database systems exploited relatively stable infrastructure: magnetic disks for storage and ever-faster single-core processors. This foundation has fundamentally changed:

#### 1. The Multi-Core Era

**Previous Reality**: Uni-processor performance improved with Moore's Law, limiting the need for high concurrency.

**Current Reality**:
- Uni-core speed increases modestly at best
- Multi-core processors mandate high concurrency for performance
- **Challenge #1**: Traditional latches block threads, limiting scalability as concurrency increases
- **Challenge #2**: Updating memory in-place causes cache line invalidations across cores, destroying cache efficiency

**Impact**: Disk latency is now "analogous to a round trip to Pluto" while CPU cache efficiency determines performance.

#### 2. Flash Storage Characteristics

**Performance Profile**:
- **Fast**: Random reads and sequential reads/writes
- **Slow**: Random writes (require erase cycle before write)
- **Observable**: Even high-end FusionIO drives (2011) show 3x faster sequential vs. random write performance

**Traditional Approaches**:
- Flash Translation Layer (FTL) attempts to hide this discrepancy
- Noticeable slowdown still exists
- Performance varies widely across device quality

**Bw-tree Approach**: Perform log structuring at the database layer, avoiding dependence on FTL for both high-end and low-end flash devices.

### Why Existing Solutions Fall Short

#### Traditional B-trees with Latches

**Problems**:
1. **Latch Contention**: High concurrency → more blocking → limited scalability
2. **Cache Invalidation**: Update-in-place destroys cache lines on all cores
3. **Context Switching**: Thread blocking incurs idle time and switch costs
4. **Random Writes**: Direct contradiction to flash storage characteristics

**BerkeleyDB Example**: Achieves only ~60% processor utilization due to latch contention, compared to Bw-tree's 99%.

#### Latch-Free Skip Lists

**Problems**:
1. **Pointer Chasing**: Non-contiguous memory access patterns
2. **Cache Inefficiency**: Only 75% L1/L2 hit rate vs. Bw-tree's 90%
3. **Random Access**: Poor cache locality for level transitions

**Result**: Bw-tree outperforms latch-free skip lists by 3.7-4.4x despite skip lists being latch-free.

---

## Core Innovations

The Bw-tree introduces three fundamental innovations that work synergistically:

### 1. Mapping Table: Virtualizing Pages

**Concept**: A level of indirection that separates logical page identity from physical location.

#### Structure

```
┌─────────────────────────────────────┐
│        Mapping Table                 │
├─────────┬───────────────────────────┤
│  PID    │  Physical Address          │
├─────────┼───────────────────────────┤
│   A     │  Memory Ptr → Page A      │
│   B     │  Flash Offset → Page B    │
│   C     │  Memory Ptr → Page C      │
│   D     │  Memory Ptr → Page D      │
└─────────┴───────────────────────────┘
```

**Key Characteristics**:

- **Logical Page Identifier (PID)**: Index into mapping table
- **Physical Address**: Either (1) memory pointer or (2) flash offset
- **Inter-Node Links**: All Bw-tree node pointers use PIDs, not physical addresses

#### Critical Enablers

**Location Independence**:
- Physical location can change on every update
- No need to propagate location changes up to root
- Enables both latch-free updates and log structuring

**Elastic Pages**:
- No fixed physical location
- No fixed size requirement
- Can grow via delta chains
- Split when convenient, not when forced by size constraints

**Isolation**:
- Update to one page only affects that page's mapping table entry
- All other pages remain unaffected
- Foundation for latch-free concurrency

### 2. Delta Updates: Avoiding Update-in-Place

**Philosophy**: Never modify a page in place; instead, append change descriptions.

#### Mechanism

**Update Process**:

```
Step 1: Create delta record D describing the change
Step 2: D physically points to current page state P (from mapping table)
Step 3: Use CAS to install D's address in mapping table
Step 4: If CAS succeeds, D becomes new page "root"; if fails, retry
```

**Visual Representation**:

```
Before Update:
┌──────────────┐
│ Mapping Table│──────────────> [Base Page P]
└──────────────┘

After Update:
┌──────────────┐
│ Mapping Table│──────> [Delta D] ──> [Base Page P]
└──────────────┘

After Multiple Updates:
┌──────────────┐
│ Mapping Table│──> [Δ3] ──> [Δ2] ──> [Δ1] ──> [Base Page P]
└──────────────┘
                    Delta Chain
```

#### Delta Types

**Leaf-Level Deltas**:
- **Insert Delta**: New record inserted
- **Modify Delta**: Existing record modified
- **Delete Delta**: Record removed (tombstone)

**Management Deltas**:
- **Split Delta**: Page has been split
- **Merge Delta**: Page merged with sibling
- **Flush Delta**: Page state written to flash
- **Index Entry Delta**: New separator key in parent

#### Benefits

**Latch-Freedom**:
- CAS is atomic hardware instruction
- Only one thread can successfully install delta
- Failed threads simply retry
- No blocking or waiting

**Cache Preservation**:
- Previous page state remains unchanged in memory
- No cache line invalidation on other cores
- Cached data remains valid
- Instructions per cycle increases dramatically

**Write Efficiency**:
- Small delta records vs. entire page rewrites
- Multiple updates share base page in memory
- Flash writes can be delta-only (partial page flush)

### 3. Compare-and-Swap (CAS) for Atomicity

**CAS Operation**:

```c
bool CAS(memory_location L, expected_value old, new_value new) {
    atomically {
        if (*L == old) {
            *L = new;
            return true;
        }
        return false;
    }
}
```

**Application in Bw-tree**:

```c
// Installing a delta update
PID page_id = P;
void* current_address = mapping_table[page_id];
Delta* delta = create_delta(change_description);
delta->next = current_address;

if (CAS(&mapping_table[page_id], current_address, delta)) {
    // Success: delta is now live
} else {
    // Failure: page was concurrently updated, retry
    retry_update();
}
```

**Why CAS Instead of Latches**:

| Aspect | Latch-Based | CAS-Based (Bw-tree) |
|--------|-------------|---------------------|
| **Blocking** | Threads block waiting | Never blocks |
| **Contention** | Serializes access | Optimistic concurrency |
| **Cache** | Destroys caches on unlock | Preserves caches |
| **Failure Mode** | Wait indefinitely | Retry immediately |
| **Scalability** | Degrades with cores | Scales linearly |
| **Utilization** | 60% (BerkeleyDB) | 99% (Bw-tree) |

---

## Architecture

### Three-Layer Design

The Bw-tree Atomic Record Store (ARS) follows classic database architecture with radical innovations at each layer:

```
┌─────────────────────────────────────┐
│      Bw-tree Layer (Access Method)   │
│  • CRUD API                          │
│  • B-tree search/update logic        │
│  • In-memory pages only              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Cache Layer                     │
│  • Logical page abstraction          │
│  • Maintains mapping table           │
│  • Moves pages: Flash ↔ RAM          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Flash Layer (LSS)               │
│  • Log-structured storage            │
│  • Sequential writes to flash        │
│  • Flash garbage collection          │
└─────────────────────────────────────┘
```

### Bw-tree Layer: Index Logic

**Responsibilities**:
- Tree-based key lookup (point queries)
- Range scans with side-link traversal
- Insert, update, delete operations
- Structure modifications (splits, merges)

**Key Difference from Traditional B-trees**:
- Operates entirely on **logical pages** (PIDs)
- Never directly manipulates physical addresses
- All updates via delta posting
- No latches at any point

**Node Structure**:

Similar to B+-tree but with crucial differences:

```
Internal Node:
┌────────────────────────────────────────┐
│ Low Key | High Key | Side Link (PID)  │
├────────────────────────────────────────┤
│ (Separator Key, Child PID) pairs       │
│ Sorted by key                          │
└────────────────────────────────────────┘

Leaf Node:
┌────────────────────────────────────────┐
│ Low Key | High Key | Side Link (PID)  │
├────────────────────────────────────────┤
│ (Key, Record) pairs                    │
│ Sorted by key                          │
└────────────────────────────────────────┘
```

**B-link Design**:
- Every node has a side link to right sibling (at same level)
- Enables split to be atomic in two phases
- Searchers can traverse side link if key range exceeded
- Critical for latch-free structure modifications

### Cache Layer: Latch-Free Page Management

**Core Component**: Mapping table providing PID → Physical Address translation.

#### Operations

**Read(PID)**:
1. Lookup PID in mapping table
2. If memory pointer: return address immediately
3. If flash offset: read page from LSS to memory, install memory pointer via CAS, return address

**Update-D(PID, delta_data)**:
1. Get current physical address from mapping table
2. Create delta record pointing to current address
3. Attempt CAS to install delta address
4. On failure: retry

**Update-R(PID, new_page_state)**:
1. Create entirely new base page (consolidation)
2. Attempt CAS to replace old page with new
3. On success: old page → garbage collection
4. On failure: discard new page

**Flush(PID)**:
1. Reserve space in LSS I/O buffer
2. Perform CAS to install flush delta (with LSS offset)
3. If CAS succeeds: copy page state to buffer
4. If CAS fails: mark buffer space as "Failed Flush"

#### Cache Management

**Swapping Out Pages**:
- Can drop any **previously flushed** portion of a page
- No I/O required (already in LSS)
- Fully swapped page: Replace memory pointer with flash offset
- Partially swapped page: Insert "partial swap" delta

**Key Advantage**: Can manage cache size without knowing page contents or transaction LSNs.

### Flash Layer: Log-Structured Store (LLAMA)

The Bw-tree's storage layer is called **LLAMA** (Latch-free, Log-structured, Access Method Aware).

#### Log-Structured Organization

**Conceptual Model**:
```
┌──────────────────────────────────────────────────────────┐
│  Flash Storage (Append-Only Log)                          │
├──────────────────────────────────────────────────────────┤
│ [Page A v1] [Page B v1] [Page A Δ] [Page C v1] [Page B Δ]│
│            Sequential Writes →                            │
└──────────────────────────────────────────────────────────┘
```

**Characteristics**:
- Pages written sequentially in large batches
- Converts many random writes → one large sequential write
- Each page flush relocates page position
- Mapping table handles location changes transparently

#### Delta Flushing

**Traditional Approach**: Flush entire page (e.g., 4KB) even for 100-byte update.

**Bw-tree Approach**:
- Flush only delta records since last flush
- Dramatically reduces data written per flush
- More pages fit in flush buffer
- Reduces write amplification

**Example**:

```
Cache State:
[Δ3] → [Δ2] → [Δ1] → [Base Page] (previously flushed)
                       └─ LSS Offset: 0x1000

Flush Operation:
• Only flushes: [Δ3][Δ2][Δ1]  (e.g., 300 bytes)
• Not flushed: [Base Page]     (already at 0x1000)
• New flush delta points back to 0x1000
```

**Read Penalty**: May need multiple flash reads to reconstruct full page. Mitigated by:
- Flash's high random read performance
- Periodic consolidation makes pages contiguous
- Large cache reduces flash reads

#### Storage Efficiency

**Traditional B-tree Pages**: Average 69% utilization (empty space for future updates).

**Bw-tree Pages**:
- **100% utilization**: No empty space in flushed pages
- **Variable length**: Packed as variable-length strings
- **Delta-only flushes**: Much less space per flush

**Impact on Write Amplification**:

Traditional Log-Structured Storage:
\[ \text{Write Amp} = \frac{\text{Data Written to Flash}}{\text{Data Updated by Application}} \]

Bw-tree reduces numerator through:
1. No empty space (69% → 100% utilization)
2. Delta-only flushes
3. No extra I/O for swapping dirty pages

#### LSS Cleaning (Garbage Collection)

**Problem**: Log storage is conceptually append-only; need to reclaim old space.

**Solution**: Circular log buffer

```
┌──────────────────────────────────────────┐
│  Oldest         Active Tail              │
│  (clean here)   (write here)             │
│     ↓                ↓                    │
│ [Old][Old][Free][Free][New][New]         │
└──────────────────────────────────────────┘
     └──────┘  ←Cleaning process
     Relocated to tail if still valid
```

**Process**:
1. Identify oldest part of log
2. For each page in that section:
   - If still current: relocate to tail (make contiguous)
   - If obsolete: discard
3. Install relocation delta in mapping table (via CAS)
4. Reclaim space

**Concurrency**: Relocation CAS can fail if page is concurrently updated; retry.

---

## Latch-Free Algorithms

### Page Search

**Leaf Page Search with Delta Chain**:

```python
def search_leaf_page(page, search_key):
    current = page  # Start at delta chain root
    
    # Traverse delta chain
    while is_delta(current):
        if current.type == INSERT and current.key == search_key:
            return current.record  # Found in delta
        elif current.type == DELETE and current.key == search_key:
            return NOT_FOUND  # Deleted
        elif current.type == MODIFY and current.key == search_key:
            return current.record  # Updated version
        
        current = current.next  # Move down chain
    
    # Reached base page
    return binary_search(current, search_key)
```

**Index Page Search**:

Similar traversal of delta chain, looking for:
- **Index Entry Delta**: New separator key directing to split sibling
- **Split Delta**: Key range invalidated, check separator key
- Base page: Binary search for child PID

**Complexity**:
- **Delta chain**: O(d) where d = delta chain length
- **Base page**: O(log n) binary search
- **Typical d**: 10-20 deltas before consolidation

### Page Consolidation

**Trigger**: Accessor thread notices delta chain exceeds threshold (e.g., 16 deltas).

**Process**:

```python
def consolidate_page(page_id):
    # Read current page state
    current_ptr = mapping_table[page_id]
    
    # Create new base page
    new_base = create_base_page()
    
    # Apply all deltas in order
    delta_chain = get_delta_chain(current_ptr)
    for delta in delta_chain:
        apply_delta_to_base(new_base, delta)
    
    # Install consolidated page
    if CAS(mapping_table[page_id], current_ptr, new_base):
        # Success: old page → garbage collection
        schedule_gc(current_ptr)
    else:
        # Failure: page updated concurrently
        # Discard new_base (another thread will consolidate)
        free(new_base)
```

**Non-Blocking**: Failed consolidation is abandoned, not retried (eventual consistency).

**Benefits**:
- Reduces memory footprint
- Improves search performance (shorter delta chains)
- Optimizes cache locality (contiguous memory)

### Garbage Collection: Epoch-Based Reclamation

**Challenge**: Cannot deallocate memory still accessed by other threads.

**Solution**: Epoch mechanism

#### Epoch Protocol

```python
class Epoch:
    current_epoch = 0
    active_threads = {}  # epoch → set of threads
    pending_gc = {}      # epoch → list of objects to free

def enter_epoch():
    tid = current_thread_id()
    epoch = current_epoch
    active_threads[epoch].add(tid)
    return epoch

def exit_epoch(epoch):
    tid = current_thread_id()
    active_threads[epoch].remove(tid)
    
    # If last thread in epoch, drain it
    if active_threads[epoch].is_empty():
        reclaim_all(pending_gc[epoch])

def schedule_for_gc(object):
    epoch = current_epoch
    pending_gc[epoch].append(object)
```

#### Invariant

\[ \text{Thread in epoch } E+1 \text{ cannot have seen objects freed in epoch } E \]

**Why**: Thread joined \(E+1\) after objects were freed in \(E\).

**Reclamation Safety**: Once all threads exit epoch \(E\), all objects in \(E\)'s pending list can be safely reclaimed.

**Protected Resources**:
- Old page states (from consolidation)
- Removed pages (from merges)
- Deallocated PIDs
- Swapped-out memory

---

## Structure Modifications (SMOs)

All Bw-tree structure modifications are latch-free, a novel achievement enabling high concurrency during tree reorganization.

### Node Split

**Trigger**: Accessor thread notices page size exceeds threshold.

**B-link Two-Phase Split**:

#### Phase 1: Child Split (Half Split)

```
Initial State:
┌──────────────┐
│   Parent O   │
└──────┬───────┘
       │
┌──────▼────────────────────────┐
│ Page P (overfull)              │
│ Keys: [10, 20, 30, 40, 50, 60] │
│ Side Link → R                  │
└────────────────────────────────┘

Step 1: Allocate new page Q
┌──────────────┐
│   Page Q     │
│ Keys: [40, 50, 60]             │
│ Side Link → R                  │
└────────────────────────────────┘

Step 2: Install split delta on P
┌──────────────┐
│   Parent O   │
└──────┬───────┘
       │
┌──────▼────────────────────────┐
│ Split Δ (KP=40, → Q)           │
│ ───────────────────────────────│
│ Page P                         │
│ Keys: [10, 20, 30, 40, 50, 60] │
│ (Keys > 40 now invalid)        │
└────────────────────────────────┘

After Phase 1:
• Search for key 50 reaches P
• Encounters split delta
• Sees key 50 > separator 40
• Follows side link to Q
• Finds key in Q
```

**Tree is valid** after Phase 1, even without parent update.

#### Phase 2: Parent Update

```
┌──────────────────────────────┐
│ Index Entry Δ (KP=40 → Q)    │
│ ─────────────────────────────│
│   Parent O                   │
└──────┬──────────┬────────────┘
       │          │
     Page P     Page Q
```

**Installation**: Post index entry delta to parent O.

**Search Optimization**: Index entry delta contains:
- Separator key KP (40)
- Pointer to Q
- High key KQ (separator for Q)

Allows instant search termination when \( KP < \text{search key} \leq KQ \).

**Consolidation**: Later consolidation creates new base pages incorporating split information.

### Node Merge

**Trigger**: Page size below threshold.

**Complexity**: More involved than split (deletes node entirely).

#### Three Atomic Steps

**Step 1: Mark for Delete**

```
┌─────────────────────────┐
│ Remove Node Δ           │
│ ────────────────────────│
│ Page R (to be removed)  │
└─────────────────────────┘
```

**Effect**: Stops all use of R; redirects to left sibling L.

**Step 2: Merge Children**

```
┌─────────────────────────┐
│ Merge Δ                 │
│ • Separator Key KR      │
│ • Physical Ptr → R      │
│ ────────────────────────│
│ Page L                  │
└─────────────────────────┘
```

**Effect**:
- L now logically includes R's key space
- L's page structure becomes a **tree** (delta chain branches)
- R's state transferred to L (will be freed when L consolidates)

**Search in Merged L**:
- Check separator key in merge delta
- If key ≤ separator: search L's original state
- If key > separator: search R's state

**Step 3: Delete Index Entry**

```
┌─────────────────────────────┐
│ Index Term Delete Δ for R   │
│ • New range for L:          │
│   Low = L's old low         │
│   High = R's old high       │
│ ────────────────────────────│
│ Parent P                    │
└─────────────────────────────┘
```

**Effect**: All paths to R blocked; PID recycling initiated (epoch-based).

### Serializing Concurrent SMOs

**Challenge**: Latch-free design means threads can observe incomplete SMOs.

**Analogy**: Like seeing uncommitted transaction state.

**Solution**: Thread encountering incomplete SMO **completes it** before proceeding.

#### Completion Protocol

```python
def update_page(page_id, update):
    page = lookup_page(page_id)
    
    # Check for incomplete SMO
    if has_split_delta(page) and not has_index_entry(parent):
        complete_split(page, parent)  # Complete before proceeding
    
    if has_remove_delta(page):
        # Page being removed, go to left sibling
        complete_merge_if_needed()
        return update_page(left_sibling, update)
    
    # Now safe to proceed with update
    install_update_delta(page_id, update)
```

**Serialization Guarantee**: SMOs are serialized in the order they are completed.

**Example**:
- Thread T1 starts split of P
- Thread T2 starts split of Q (sibling of P)
- T2 encounters T1's incomplete split when trying to update parent
- T2 completes T1's split first
- Then T2 completes its own split
- **Result**: T1's split serializes before T2's split

---

## Range Scans

**Specification**: Key range [low_key, high_key], ordering (ascending/descending).

### Scan Protocol

```python
def range_scan(low_key, high_key):
    # Find starting leaf page
    current_page = find_leaf(low_key)
    cursor_key = low_key
    results = []
    
    while cursor_key <= high_key:
        # Construct vector of records in range on this page
        page_records = extract_records_in_range(current_page, cursor_key, high_key)
        
        # Each next-record is atomic
        for record in page_records:
            # Check if page updated since vector construction
            if page_updated_in_range(current_page, record.key, high_key):
                # Reconstruct vector
                page_records = extract_records_in_range(current_page, record.key, high_key)
            
            results.append(record)
            cursor_key = record.key + 1
        
        # Move to next page via side link
        current_page = current_page.side_link
    
    return results
```

**Characteristics**:
- **Not Transactional**: Entire scan is not atomic
- **Per-Record Atomicity**: Each "next-record" operation is atomic
- **Concurrent Updates**: Detects updates to unread portions and reconstructs vector
- **Side Links**: Traverse right using B-link side pointers

**Concurrency Control**: External locking (if needed) handled by transaction component, not Bw-tree.

---

## LLAMA: Log-Structured Access Method Aware

LLAMA is the cache/storage subsystem that generalizes the Bw-tree's latch-free and log-structuring techniques.

### Architecture

LLAMA provides a **page-oriented API** supporting multiple access methods:

```
┌─────────────────────────────────────┐
│    Access Method (e.g., Bw-tree)    │
│  Uses LLAMA API:                    │
│  • Update-D, Update-R, Read         │
│  • Flush, Mk-Stable, Hi-Stable      │
│  • Allocate, Free                   │
│  • TBegin, TCommit, TAbort          │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│         Cache Layer (CL)            │
│  • Latch-free page updating (CAS)   │
│  • Mapping table management         │
│  • Partial page swapout             │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│      Storage Layer (SL)             │
│  • Log-structured organization      │
│  • Atomic flush buffering           │
│  • LSS cleaning                     │
└─────────────────────────────────────┘
```

### API Operations

#### Page Data Operations

**Update-D(PID, in-ptr, out-ptr, data)**:
- Delta update prepending change to prior state
- `in-ptr`: Prior page state
- `out-ptr`: New page state
- `data`: Change description (e.g., \<lsn, key, record\>)

**Update-R(PID, in-ptr, out-ptr, data)**:
- Replacement update with entirely new state
- `data`: Complete new page state (deltas folded in)

**Read(PID, out-ptr)**:
- Returns memory address of page
- Fetches from flash if not in memory

#### Page Management Operations

**Flush(PID, in-ptr, out-ptr, annotation)**:
- Copies page state to LSS I/O buffer
- Prepends flush delta (with LSS offset and annotation)
- Does not guarantee stability until Mk-Stable

**Mk-Stable(LSS_address)**:
- Ensures all flushes up to given LSS address are stable

**Hi-Stable()**:
- Returns highest stable LSS address

**Allocate() → PID**:
- Allocates new page in mapping table
- Always part of system transaction

**Free(PID)**:
- Makes PID available for reuse (epoch-based)
- Always part of system transaction

#### System Transaction Operations

**TBegin() → TID**:
- Initiates transaction
- Enters into Active Transaction Table (ATT)

**TCommit(TID)**:
- Commits transaction
- Installs all page changes atomically
- Flushes to LSS buffer

**TAbort(TID)**:
- Aborts transaction
- Resets pages to transaction begin state
- No changes flushed

### System Transactions for SMOs

**Purpose**: Provide atomicity for Structure Modification Operations.

**Example: Node Split**

```python
tid = TBegin()

# Allocate new sibling page (logged)
Q = Allocate()  

# Create sibling content
Update-D(Q, NULL, Q_ptr, Q_data, tid)

# Post split delta to original page
Update-D(P, P_ptr, P_new_ptr, split_delta, tid)

# Commit: all operations flushed atomically
TCommit(tid)
```

**Isolation**: New page Q invisible until commit (no external PID references).

**Atomicity**: All-or-nothing via LSS logging.

**Durability**: Relative (written to LSS buffer, stable later via Mk-Stable).

### Atomic Flush Buffering

**Challenge**: Latch-free, asynchronous, multi-threaded flushing.

#### Buffer State

```c
struct FlushBuffer {
    void* Base;          // Buffer address
    int Bsize;           // Buffer size
    int Offset;          // High water mark
    bool Sealed;         // No more writes
    int Active;          // Active writers
    int CURRENT;         // Current buffer index
};
```

#### Allocation Protocol

```python
def allocate_buffer_space(size):
    while True:
        state = read_buffer_state()
        
        if state.Offset + size <= state.Bsize:
            # Space available
            new_state = state.copy()
            new_state.Offset += size
            new_state.Active += 1
            
            if CAS(buffer_state, state, new_state):
                return state.Offset  # Reserved space
        else:
            # Seal buffer
            if not state.Sealed:
                new_state = state.copy()
                new_state.Sealed = True
                CAS(buffer_state, state, new_state)
            
            # Switch to next buffer
            switch_to_next_buffer()
```

#### Write-to-Flash Protocol

```python
def finish_buffer_write():
    state = read_buffer_state()
    new_state = state.copy()
    new_state.Active -= 1
    
    if CAS(buffer_state, state, new_state):
        if new_state.Sealed and new_state.Active == 0:
            # Last writer, initiate I/O
            initiate_async_io(buffer)
```

**Completion**: I/O completion unseals buffer, resets Offset and Active.

**Multiple Buffers**: Round-robin buffer ring for continuous operation.

---

## Performance Evaluation

### Experimental Setup

**Hardware**:
- **CPU**: 20-core Intel Xeon
- **Memory**: 256 GB (restricted to varying amounts for testing)
- **Storage**: 960 GB SSD (~200 MB/s bandwidth)

**Systems Compared**:
- **BerkeleyDB**: Traditional B-tree with latches
- **Latch-Free Skip List**: Lock-free concurrent skip list
- **Bw-tree**: Full implementation with LLAMA

**Workloads**:
1. **Real-world**: Xbox Live game sessions, deduplication metadata
2. **Synthetic**: Uniform and Zipfian key distributions, varying read/write ratios

**Configuration**:
- Database size: Exceeds memory (forces I/O)
- Key size: 16 bytes
- Value size: 1 KB
- Threads: 8-20 concurrent workers

### Results: Throughput

#### In-Memory Performance (Cache-Resident)

| Workload | Bw-tree vs. BerkeleyDB | Bw-tree vs. Skip List |
|----------|------------------------|----------------------|
| **Xbox Live** | **18.7x faster** | **3.7x faster** |
| **Deduplication** | **8.6x faster** | N/A |
| **Synthetic (Uniform)** | **5.8x faster** | **4.4x faster** (read-only) |

**Key Observations**:
- Bw-tree achieves 99% CPU utilization vs. 60% for BerkeleyDB
- Massive speedup even over latch-free skip list
- Real-world workloads show highest gains

#### I/O-Bound Performance (Flash Storage)

**Xbox Live Workload** (with flash I/O):
- **Bw-tree**: 2.1x faster than BerkeleyDB
- **Explanation**: Log-structured sequential writes vs. random writes

**Write Amplification**:
- **BerkeleyDB**: 10-15x (entire page writes, random I/O)
- **Bw-tree**: 3-5x (delta-only flushes, sequential I/O)

### Results: Cache Efficiency

**L1/L2 Cache Hit Rates**:

| System | Cache Hit Rate | Explanation |
|--------|---------------|-------------|
| **Bw-tree** | **~90%** | Contiguous base pages, binary search |
| **Skip List** | **~75%** | Pointer chasing, non-contiguous nodes |
| **BerkeleyDB** | **~70%** | Update-in-place invalidations |

**Instructions Per Cycle (IPC)**:

| System | IPC | Impact |
|--------|-----|--------|
| **Bw-tree** | **2.8** | High efficiency |
| **Skip List** | **2.1** | Moderate |
| **BerkeleyDB** | **1.4** | Low (cache misses, blocking) |

**Why Bw-tree Dominates**:
1. **Delta updates**: No cache invalidations
2. **Contiguous base pages**: Binary search on sequential memory
3. **No blocking**: No context switches destroying caches

### Results: Latch-Free Failure Rates

**CAS Failure Rates** (percentage of operations needing retry):

| Operation | Failure Rate (Real) | Failure Rate (Synthetic) |
|-----------|---------------------|--------------------------|
| **Record Update** | < 0.02% | < 0.02% |
| **Split** | 1.25% | 8.88% |
| **Consolidation** | 1.25% | 8.88% |

**Interpretation**:
- **Very low** for common operations (updates)
- **Acceptable** for rare operations (SMOs)
- Synthetic workloads stress system more (higher contention)

**Impact**: Retry overhead negligible compared to latch contention elimination.

### Results: Delta Chain Length

**Optimal Length**: 10-20 deltas before consolidation

**Trade-off**:

```
Short Chains (< 5 deltas):
• Pro: Fast search
• Con: Frequent consolidation overhead

Long Chains (> 30 deltas):
• Pro: Infrequent consolidation
• Con: Slow delta chain traversal

Sweet Spot (10-20):
• Balanced search + consolidation cost
```

**Depends on**:
- Record size (larger records → fewer deltas fit in L1)
- Update pattern (hot keys → longer chains acceptable)
- Workload (read-heavy → prefer shorter chains)

---

## Deployment in Microsoft Products

The Bw-tree is not just academic research—it's **shipping in production** at Microsoft.

### SQL Server Hekaton

**Context**: Main-memory optimized OLTP engine (in-memory database).

**Bw-tree Role**: **Range Index** (ordered index)

**Characteristics**:
- Completely latch-free (entire engine)
- Multi-versioned, optimistic concurrency control
- Two index types:
  - **Hash Index**: Latch-free hash table for equality lookups
  - **Range Index**: Bw-tree for range queries

**Integration**:
- Leaf nodes point to multi-version record chains
- Supports MVCC (Multi-Version Concurrency Control)
- Snapshot isolation for transactions

**Performance**: Critical for Hekaton's 10-30x OLTP speedup over disk-based SQL Server.

### Azure DocumentDB

**Context**: Distributed document-oriented NoSQL database.

**Bw-tree Role**: **Indexing Engine**

**Characteristics**:
- Indexes JSON documents
- Supports secondary indexes on document properties
- Distributed across partitions

**Benefits**:
- High concurrency for multi-tenant cloud workloads
- Efficient writes (critical for document ingestion)
- Range queries on indexed properties

### Bing ObjectStore

**Context**: Distributed key-value store backend for Bing search.

**Bw-tree Role**: **Ordered Key-Value Store**

**Characteristics**:
- Massive scale (billions of keys)
- High read/write throughput
- Geographic replication

**Benefits**:
- Latch-freedom for high query concurrency
- Log-structured storage for flash SSDs
- Efficient range scans for related objects

---

## Comparison with Traditional B-trees

### Architectural Differences

| Aspect | Traditional B-tree | Bw-tree |
|--------|-------------------|---------|
| **Concurrency** | Latch-based | Latch-free (CAS) |
| **Updates** | In-place | Delta append |
| **Pointers** | Physical addresses | Logical PIDs |
| **Pages** | Fixed location | Virtualized (mapping table) |
| **Cache** | Update-in-place invalidates | Delta preserves caches |
| **Storage** | Random writes | Log-structured |
| **Size** | Fixed (e.g., 4KB) | Elastic (delta chains) |

### Performance Comparison

#### Scalability

**Traditional B-tree (BerkeleyDB)**:
- Latch contention increases with threads
- **1 thread**: 100% relative performance
- **8 threads**: 180% (1.8x, not 8x)
- **20 threads**: 200% (saturates at 60% CPU)

**Bw-tree**:
- Linear scaling up to hardware limits
- **1 thread**: 100% relative performance
- **8 threads**: 750% (7.5x, near-linear)
- **20 threads**: 1800% (18x, approaching ideal)

**Why**: No latch contention, no blocking, 99% CPU utilization.

#### Write Performance

**Random Writes to Flash**:

| Metric | Traditional B-tree | Bw-tree |
|--------|-------------------|---------|
| **Write Amp** | 10-15x | 3-5x |
| **I/O Pattern** | Random | Sequential |
| **Page Utilization** | 69% | 100% |
| **Flash Wear** | High | Low (wear leveling) |

#### Read Performance

**Point Queries**:
- **Bw-tree**: Slightly slower (delta chain traversal)
- **Typical overhead**: 10-20% if chain length managed
- **Offset by**: Superior cache efficiency

**Range Scans**:
- **Bw-tree**: Comparable or better
- **Side links**: Efficient sibling traversal
- **Cache**: Better locality for sequential access

---

## Lessons Learned and Design Insights

### 1. Latch-Free ≠ Lock-Free Data Structure

**Distinction**:
- **Lock-Free**: Algorithm guarantees system-wide progress (at least one thread makes progress)
- **Latch-Free**: No latches, but doesn't guarantee progress (CAS can fail indefinitely in theory)

**Bw-tree Approach**: Latch-free with very low CAS failure rates in practice (<0.02% for updates).

### 2. Mapping Table is the Key Enabler

**Without mapping table**:
- Cannot change physical location without updating all parent pointers
- Cannot use delta updates (physical pointers become invalid)
- Cannot do latch-free updates (need to protect entire path)

**With mapping table**:
- Single CAS changes entire page state
- Physical relocation isolated to one entry
- Delta chains feasible

### 3. Cache Efficiency Beats Algorithm Complexity

**Surprising Result**: Bw-tree beats latch-free skip list despite:
- Skip lists: Simpler, no consolidation overhead
- Bw-trees: Delta chain traversal, consolidation cost

**Reason**: Cache efficiency (90% vs. 75%) dominates.

**Takeaway**: On modern hardware, **cache locality > algorithmic complexity**.

### 4. Log Structuring Works for Main Memory Too

**Traditional View**: Log structuring for storage only.

**Bw-tree Insight**: Delta updates are "log structuring for main memory."

**Benefits**:
- No cache invalidations (like avoiding random writes)
- Append-only deltas (like sequential writes)
- Periodic consolidation (like garbage collection)

### 5. Optimistic Beats Pessimistic at Scale

**Pessimistic (Latches)**:
- Assume conflict will occur
- Block preemptively
- Low concurrency, high safety

**Optimistic (CAS)**:
- Assume conflict is rare
- Proceed, retry if conflict
- High concurrency, low overhead

**Bw-tree Evidence**: <0.02% failure rate validates optimistic assumption.

---

## Limitations and Challenges

### 1. Delta Chain Length Management

**Problem**: Long delta chains degrade search performance.

**Mitigation**:
- Consolidation threshold (e.g., 16 deltas)
- Workload-dependent tuning

**Remaining Challenge**: No adaptive mechanism; fixed threshold may not suit all workloads.

### 2. Consolidation Overhead

**Cost**: Allocating and populating new base page.

**When**: Failed consolidations waste work (another thread updated page).

**Impact**: 1.25-8.88% failure rate for consolidations.

**Trade-off**: Worth it for improved search performance, but non-zero cost.

### 3. Point Query Latency

**Overhead**: Delta chain traversal before base page.

**Typical**: 10-30% slower than direct base page access.

**Offset By**: Superior cache hit rates improve overall performance.

**Workload Dependency**: Read-heavy workloads may prefer shorter chains.

### 4. Complexity of Latch-Free SMOs

**Implementation Difficulty**:
- Handling incomplete SMOs
- Serializing concurrent SMOs
- Epoch-based garbage collection

**Debugging Challenges**: Non-deterministic interleavings, subtle race conditions.

**Maintenance**: Requires deep expertise in lock-free programming.

### 5. Flash-Specific Optimization

**Advantage**: 3x faster sequential writes.

**Limitation**: Benefits less pronounced on:
- NVMe SSDs (random/sequential difference smaller)
- Persistent memory (byte-addressable, no erase cycles)

**Future**: May need re-architecting for new storage technologies.

---

## Future Directions and Extensions

### 1. Adaptive Delta Chain Management

**Current**: Fixed consolidation threshold.

**Proposed**: Dynamic threshold based on:
- Workload (read-heavy → consolidate sooner)
- Key hotness (hot keys → tolerate longer chains)
- Memory pressure (low memory → consolidate aggressively)

**Mechanism**: Machine learning or heuristic-based adaptation.

### 2. Multi-Version Bw-tree

**Goal**: Native MVCC support within Bw-tree.

**Approach**:
- Delta records include version information
- Garbage collect old versions
- Support time-travel queries

**Benefit**: Eliminate separate version chains (as in Hekaton).

### 3. Distributed Bw-tree

**Challenge**: Extend latch-free techniques to distributed settings.

**Questions**:
- How to maintain mapping table across nodes?
- Network CAS equivalents?
- Distributed SMOs?

**Potential**: Combine with RDMA for low-latency remote CAS.

### 4. Persistent Memory Integration

**Context**: Intel Optane, non-volatile memory.

**Challenges**:
- Byte-addressable: No need for page abstraction?
- Persistence: Delta chains complicate crash recovery
- Wear leveling: Different from flash

**Research**: Rethink delta updates for persistent memory.

### 5. Learned Indexes Integration

**Idea**: Use machine learning models to approximate key positions.

**Integration with Bw-tree**:
- Model predicts base page location
- Delta chain handles model errors
- Consolidation retrains model

**Benefit**: O(1) search instead of O(log n) in best case.

---

## Key Contributions Summary

### 1. Latch-Free B-tree Design

**Achievement**: First fully latch-free B-tree with structure modifications.

**Impact**: Demonstrates feasibility of complex latch-free data structures.

**Novelty**: Prior latch-free indexes (skip lists, hash tables) simpler; Bw-tree handles hierarchical structure.

### 2. Delta Update Paradigm

**Contribution**: Separation of logical page state from physical representation.

**Benefits**:
- Latch-freedom via CAS
- Cache preservation
- Write efficiency (delta-only flushes)

**Generality**: Applicable to other index structures (not just B-trees).

### 3. Mapping Table Virtualization

**Innovation**: Page identity virtualized through level of indirection.

**Enables**:
- Physical relocation without propagation
- Latch-free updates (single CAS)
- Elastic page sizes

**Influence**: Adopted in other modern storage systems.

### 4. Log-Structured Storage for Flash

**Contribution**: Application-level log structuring outperforms FTL-only approaches.

**Techniques**:
- Delta-only flushing
- 100% page utilization
- Contiguous consolidation

**Impact**: Reduces write amplification from 10-15x to 3-5x.

### 5. Production System Validation

**Significance**: Not just research prototype; shipping in Microsoft products.

**Products**:
- SQL Server Hekaton (since 2014)
- Azure DocumentDB (since 2015)
- Bing ObjectStore (since 2013)

**Validation**: Handles billions of operations daily at scale.

### 6. LLAMA Subsystem

**Contribution**: Generalization of Bw-tree techniques to support any access method.

**API**: Page-oriented, latch-free, log-structured.

**Impact**: Reusable infrastructure for latch-free index structures.

---

## Conclusion

The Bw-tree represents a **fundamental rethinking of B-tree design** for modern hardware. By eliminating latches, avoiding update-in-place, and virtualizing pages through a mapping table, it achieves performance levels previously unattainable with traditional approaches.

### Core Innovations

1. **Latch-Free Concurrency**: CAS-based atomicity without blocking
2. **Delta Updates**: Preserve caches, enable partial flushes
3. **Mapping Table**: Virtualize pages for location independence
4. **Log-Structured Storage**: Sequential writes optimized for flash

### Performance Achievements

- **18.7x faster** than BerkeleyDB (in-memory)
- **4.4x faster** than latch-free skip lists
- **99% CPU utilization** vs. 60% for latched systems
- **90% cache hit rate** vs. 70-75% for alternatives
- **3-5x write amplification** vs. 10-15x for traditional B-trees

### Real-World Impact

The Bw-tree's deployment in **SQL Server Hekaton**, **Azure DocumentDB**, and **Bing ObjectStore** validates its effectiveness at scale. It handles billions of daily operations, demonstrating that research innovations can transition to production systems.

### Broader Lessons

1. **Hardware Trends Demand New Designs**: Multi-core and flash storage require rethinking classic algorithms
2. **Cache Efficiency Dominates**: On modern CPUs, cache locality matters more than algorithmic complexity
3. **Optimistic Concurrency Scales**: CAS-based approaches outperform latches at high concurrency
4. **Indirection Enables Flexibility**: Mapping table is the key enabler for multiple innovations
5. **Log Structuring Beyond Storage**: Delta updates bring log-structuring benefits to main memory

### Future Outlook

The Bw-tree paradigm extends beyond traditional B-trees. Its principles—latch-freedom, delta updates, and virtualized pages—are applicable to:
- Hash indexes
- Spatial indexes
- Time-series databases
- Persistent memory systems

As hardware continues to evolve (NVMe, persistent memory, massively multi-core), the Bw-tree's emphasis on **cache efficiency**, **latch-freedom**, and **write optimization** will remain relevant.

**Final Thought**: The Bw-tree demonstrates that classical data structures, when redesigned from first principles for modern hardware, can achieve order-of-magnitude performance improvements. It serves as a template for how to approach system design in an era of rapidly evolving hardware platforms.

---

## References

**Primary Paper**:
- Levandoski, J. J., Lomet, D. B., & Sengupta, S. (2013). The Bw-Tree: A B-tree for new hardware platforms. In *2013 IEEE 29th International Conference on Data Engineering (ICDE)* (pp. 302-313). IEEE. [PDF](https://15721.courses.cs.cmu.edu/spring2016/papers/bwtree-icde2013.pdf)

**LLAMA Subsystem**:
- Levandoski, J., Lomet, D., & Sengupta, S. (2013). LLAMA: A cache/storage subsystem for modern hardware. In *Proceedings of the VLDB Endowment*, 6(10), 877-888.

**SQL Server Hekaton**:
- Diaconu, C., Freedman, C., Ismert, E., Larson, P. A., Mittal, P., Stonecipher, R., ... & Zwilling, M. (2013). Hekaton: SQL server's memory-optimized OLTP engine. In *Proceedings of the 2013 ACM SIGMOD International Conference on Management of Data* (pp. 1243-1254).

**Related Work**:
- Fraser, K. (2004). *Practical lock-freedom*. PhD Thesis, University of Cambridge.
- O'Neil, P., Cheng, E., Gawlick, D., & Onuegbe, E. (1996). The log-structured merge-tree (LSM-tree). *Acta Informatica*, 33(4), 351-385.
- Rosenblum, M., & Ousterhout, J. K. (1992). The design and implementation of a log-structured file system. *ACM Transactions on Computer Systems*, 10(1), 26-52.

**B-link Trees**:
- Lehman, P. L., & Yao, S. B. (1981). Efficient locking for concurrent operations on B-trees. *ACM Transactions on Database Systems*, 6(4), 650-670.

**Implementations**:
- Open Bw-Tree: [GitHub - wangziqi2013/BwTree](https://github.com/wangziqi2013/BwTree)

**Follow-up Research**:
- Wang, Z., Pavlo, A., Lim, H., Leis, V., & Kaminsky, M. (2018). Building a Bw-Tree takes more than just buzz words. In *Proceedings of the 2018 International Conference on Management of Data* (pp. 473-488).

---

## Appendix: Key Terminology

**Atomic Record Store (ARS)**: System supporting atomic CRUD operations on keyed records.

**B-link Tree**: B-tree variant with side links between siblings at each level, enabling atomic splits.

**Compare-and-Swap (CAS)**: Atomic CPU instruction that updates memory location only if current value matches expected value.

**Delta Chain**: Sequence of delta records prepended to a base page, representing incremental updates.

**Delta Record**: Small record describing a single page modification (insert, update, delete, split, etc.).

**Epoch**: Time period used for safe garbage collection; resources freed in epoch \(E\) can be reclaimed after all threads exit \(E\).

**Flush Delta**: Management delta indicating page state has been written to flash storage.

**Latch-Free**: Design where threads never block on synchronization primitives (latches); uses atomic operations instead.

**LLAMA**: Latch-free, Log-structured, Access Method Aware subsystem for cache and storage management.

**Log-Structured Storage (LSS)**: Storage organization where updates are appended sequentially; old space reclaimed via garbage collection.

**Mapping Table**: Indirection layer mapping logical Page IDs (PIDs) to physical addresses (memory or flash).

**Page Consolidation**: Process of creating new base page by applying all delta updates, optimizing search performance.

**Page Identifier (PID)**: Logical identifier (index into mapping table) referencing a page.

**Structure Modification Operation (SMO)**: Tree reorganization operation like split or merge.

**Write Amplification**: Ratio of data written to storage vs. data written by application; lower is better.

---

*This technical blog post provides an in-depth analysis of the Bw-Tree for educational purposes. For production deployment, consult the original papers and Microsoft's implementation documentation.*