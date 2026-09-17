---
id: gpu-memory-hierarchy
title: GPU Memory Hierarchy & Bandwidth
parent: computer-science
order: 1
summary: Deep dive into Register files, Shared Memory/L1, L2 Cache, and HBM memory tiers in modern GPUs.
tags: [gpu, memory, hardware, cuda]
color: rose
difficulty: Advanced
---

# GPU Memory Subsystem

Understanding latency and bandwidth disparities across modern GPU compute tiers (NVIDIA Hopper / Blackwell architectures).

## Memory Tiers Overview

| Tier | Latency | Bandwidth / Capacity | Description |
|---|---|---|---|
| **1. Register File** | ~1 cycle | > 30 TB/s aggregated | Fastest on-chip storage directly adjacent to ALUs. |
| **2. Shared Memory / L1** | ~20-30 cycles | ~228 KB per SM | Programmer-managed cache per Streaming Multiprocessor (SM). |
| **3. L2 Cache** | ~200 cycles | 50 MB - 60 MB | Shared crossbar cache connecting all SMs. |
| **4. High Bandwidth Memory (HBM3e)** | ~400-600 cycles | 3.35 TB/sec | Off-chip stacked DRAM connected via silicon interposer. |

---

## Why Memory Latency Hiding Matters in CUDA

Because global memory latency is roughly 400 to 600 clock cycles, the CUDA warp scheduler rapidly switches active execution to another ready warp whenever the current warp stalls on a memory fetch. Having sufficient warp occupancy is the primary mechanism for saturating available execution throughput.
