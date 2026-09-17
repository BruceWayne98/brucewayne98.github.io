---
id: cnn
title: Convolutional Neural Networks (CNNs)
parent: deep-learning
order: 2
summary: Translation-invariant vision models leveraging convolutional kernels, pooling, and spatial hierarchies.
tags: [vision, convolution, cnn, resnet]
color: emerald
difficulty: Intermediate
---

# Convolutional Neural Networks (CNN)

Convolutional Neural Networks are designed to process grid-structured topology data, most notably 2D images. They exploit spatial locality and translation invariance through shared weights.

## 2D Discrete Convolution Formula

Given an input feature map $I$ and kernel $K$ of size $k \times k$:

$$S(i, j) = (I * K)(i, j) = \sum_{m} \sum_{n} I(i-m, j-n) K(m, n)$$

## Key CNN Components

1. **Convolutional Layer**: Applies learnable filters to extract local edge, texture, and pattern representations.
2. **Activation Layer**: ReLU ($f(x) = \max(0, x)$) introduces non-linearity.
3. **Pooling Layer (Max / Average)**: Reduces spatial resolution, increasing receptive field size and reducing parameter count.
4. **Skip Connections (ResNet)**: Preserves gradient flow through identity mappings:

$$\mathbf{y} = \mathcal{F}(\mathbf{x}, \{W_i\}) + \mathbf{x}$$

```mermaid
flowchart LR
    Input[Input Image 224x224x3] --> Conv1[Conv 7x7, s=2]
    Conv1 --> MaxPool[Max Pool 3x3, s=2]
    MaxPool --> ResBlock1[Residual Stage 1]
    ResBlock1 --> ResBlock2[Residual Stage 2]
    ResBlock2 --> AvgPool[Global Average Pool]
    AvgPool --> FC[Dense Linear Layer]
    FC --> Probs[Class Probabilities]
```
