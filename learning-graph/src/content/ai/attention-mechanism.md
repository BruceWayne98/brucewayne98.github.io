---
id: attention-mechanism
title: Self-Attention & Multi-Head Attention
parent: transformers
order: 1
summary: Mathematical breakdown of Scaled Dot-Product Attention, queries, keys, values, and multi-head projections.
tags: [math, attention, qkv, softmax]
color: cyan
difficulty: Advanced
---

# Self-Attention & Multi-Head Attention

Self-Attention allows each position in a sequence to attend to all other positions, dynamically weighting the importance of different tokens based on contextual relevance.

## 1. Scaled Dot-Product Attention

Given input matrices Query ($Q$), Key ($K$), and Value ($V$) with dimension $d_k$:

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{Q K^T}{\sqrt{d_k}}\right) V$$

### Why scale by $\frac{1}{\sqrt{d_k}}$?
For large values of $d_k$, the dot products grow large in magnitude, pushing the softmax function into regions where it has extremely small gradients (vanishing gradients). The factor $\frac{1}{\sqrt{d_k}}$ scales the variance back to 1:

$$\text{Var}(q \cdot k) = \sum_{i=1}^{d_k} \text{Var}(q_i k_i) = d_k \cdot 1 = d_k \implies \text{Var}\left(\frac{q \cdot k}{\sqrt{d_k}}\right) = 1$$

## 2. Multi-Head Attention Computation

Instead of performing a single attention function, Multi-Head Attention projects $Q, K, V$ into $h$ distinct lower-dimensional subspaces:

$$\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, \dots, \text{head}_h) W^O$$

where each individual head is:

$$\text{head}_i = \text{Attention}(Q W_i^Q, K W_i^K, V W_i^V)$$

```mermaid
flowchart TD
    Q[Input Q] --> WQ[Linear Projections W_i^Q]
    K[Input K] --> WK[Linear Projections W_i^K]
    V[Input V] --> WV[Linear Projections W_i^V]
    WQ --> Dot[MatMul: Q * K^T]
    WK --> Dot
    Dot --> Scale[Scale / sqrt(d_k)]
    Scale --> Mask[Optional Masking]
    Mask --> Softmax[Softmax]
    Softmax --> MatMulV[MatMul with V]
    WV --> MatMulV
    MatMulV --> Concat[Concat all Heads]
    Concat --> OutputW[Linear Output W_o]
```

## Python Implementation Snippet

```python
import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)
    
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
        
    weights = F.softmax(scores, dim=-1)
    return torch.matmul(weights, V), weights
```
