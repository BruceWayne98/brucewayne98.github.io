---
id: computer-science
title: Computer Systems & Architecture
parent: null
order: 3
summary: Hardware acceleration, parallel compute hierarchies, cache locality, and distributed clusters.
tags: [systems, hardware, gpu, computing]
color: rose
difficulty: Intermediate
---

# Computer Systems & Architecture

Modern AI workloads demand massive throughput, making understanding CPU cache hierarchies, GPU SIMT (Single Instruction Multiple Threads), and memory bandwidth indispensable.

```mermaid
flowchart TD
    CPU[Host CPU & Main RAM DDR5] <==>|PCIe Gen 5 / CXL| GPU[GPU Accelerator]
    GPU --> SM1[Streaming Multiprocessor 0]
    GPU --> SM2[Streaming Multiprocessor 1]
    GPU --> SMN[Streaming Multiprocessor N]
    SM1 --> TensorCores[Tensor Cores: FP16 / FP8 / BF16 MatMul]
    SM1 --> SRAM[High-Speed Shared Memory / L1]
    GPU --> HBM[High Bandwidth Memory HBM3e: 3.35 TB/s]
```

## Compute vs Memory Bound Operations

In deep learning, operators are characterized by their **Arithmetic Intensity**:

$$\text{Arithmetic Intensity} = \frac{\text{FLOPs}}{\text{Bytes Transferred}}$$

- **Memory Bound**: Operations like LayerNorm, Softmax, elementwise additions ($\text{Arithmetic Intensity} < 10$).
- **Compute Bound**: General Matrix Multiply (GEMM), Convolutions ($\text{Arithmetic Intensity} > 100$).
