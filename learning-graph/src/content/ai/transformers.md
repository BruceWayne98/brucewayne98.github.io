---
id: transformers
title: Transformers
parent: deep-learning
order: 1
summary: The cornerstone architecture of modern LLMs, eliminating recurrence in favor of self-attention mechanisms.
tags: [transformers, attention, llm, nlp]
color: indigo
difficulty: Advanced
---

# Transformer Architecture

Introduced in the seminal 2017 paper *"Attention Is All You Need"* by Vaswani et al., the Transformer revolutionized Natural Language Processing and Deep Learning by replacing recurrent connections with parallelizable **Self-Attention**.

## Architecture Overview

```mermaid
flowchart TD
    subgraph Encoder
        E_In[Input Tokens] --> E_Emb[Token & Positional Embedding]
        E_Emb --> E_MHA[Multi-Head Self-Attention]
        E_MHA --> E_Norm1[Add & LayerNorm]
        E_Norm1 --> E_FFN[Feed-Forward Network]
        E_FFN --> E_Norm2[Add & LayerNorm]
    end
    subgraph Decoder
        D_In[Target Tokens] --> D_Emb[Output Embedding]
        D_Emb --> D_MaskMHA[Masked Multi-Head Attention]
        D_MaskMHA --> D_Norm1[Add & LayerNorm]
        D_Norm1 --> D_CrossMHA[Cross-Attention]
        E_Norm2 -.->|K, V| D_CrossMHA
        D_CrossMHA --> D_Norm2[Add & LayerNorm]
        D_Norm2 --> D_FFN[Feed-Forward Network]
        D_FFN --> D_Norm3[Add & LayerNorm]
        D_Norm3 --> Linear[Linear Projection]
        Linear --> Softmax[Softmax Probabilities]
    end
```

## Why Transformers Dominate
1. **Full Parallelization**: Unlike RNNs where token $t$ depends on step $t-1$, Transformers process all sequence tokens simultaneously.
2. **Direct Long-Range Dependency**: Path length between any two tokens in a sequence is $O(1)$ compared to $O(N)$ in RNNs.
3. **Scalability**: Follows empirical scaling laws with parameters and compute.
