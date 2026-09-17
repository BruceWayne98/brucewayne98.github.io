---
id: linear-algebra
title: Linear Algebra & Matrix Decompositions
parent: mathematics
order: 1
summary: Vector spaces, linear maps, eigenvalues, eigenvectors, and Singular Value Decomposition (SVD).
tags: [math, vectors, svd, matrices]
color: emerald
difficulty: Intermediate
---

# Linear Algebra & Matrix Decompositions

Linear algebra provides the mathematical framework for manipulating multidimensional arrays and vector operations.

## Eigenvalues and Eigenvectors

For a square matrix $A \in \mathbb{R}^{n \times n}$, a non-zero vector $v$ is an eigenvector with corresponding eigenvalue $\lambda$ if:

$$A v = \lambda v \iff (A - \lambda I) v = 0$$

The characteristic polynomial whose roots yield $\lambda$:

$$\det(A - \lambda I) = 0$$

## Singular Value Decomposition (SVD)

Any real matrix $A \in \mathbb{R}^{m \times n}$ can be factored into three matrices:

$$A = U \Sigma V^T$$

Where:
- $U \in \mathbb{R}^{m \times m}$ is an orthogonal matrix (left singular vectors)
- $\Sigma \in \mathbb{R}^{m \times n}$ is a diagonal matrix containing singular values $\sigma_1 \ge \sigma_2 \ge \dots \ge 0$
- $V \in \mathbb{R}^{n \times n}$ is an orthogonal matrix (right singular vectors)

$$\|A - A_k\|_F = \sqrt{\sum_{i=k+1}^{\min(m,n)} \sigma_i^2}$$
