---
title: "Generalized Collective Algorithms for the Exascale Era"
collection: publications
category: conferences
permalink: /publication/2023-10-31-generalized-collectives
excerpt: 'Generalized collective communication algorithms for the exascale era.'
date: 2023-10-31
venue: '2023 IEEE International Conference on Cluster Computing'
paperurl: '/files/generalized_collectives.pdf'
citation: 'M. Wilkins et al., "Generalized Collective Algorithms for the Exascale Era," 2023 IEEE International Conference on Cluster Computing (CLUSTER), Santa Fe, NM, USA, 2023, pp. 60-71, doi: 10.1109/CLUSTER52292.2023.00013.'
---

Exascale supercomputers have renewed the exigence of improving distributed communication, specifically MPI collectives. Previous works accelerated collectives for specific scenarios by changing the radix of the collective algorithms. However, these approaches fail to explore the interplay between modern hardware features, such as multi-port networks, and software features, such as message size. In this paper, we present a novel approach that uses system-agnostic, generalized (i.e., variableradix) algorithms to capture relevant features and provide broad speedups for upcoming exascale-class supercomputers.We identify hardware commonalities found on announced exascale systems and three omnipresent communication kernels (binomial tree, ring, and recursive doubling) that can be generalized to better leverage these features, creating 10 total implementations. For each kernel, we develop analytical models to intuit algorithm performance with varying radix values.Experiments on the world’s first exascale supercomputer (Frontier at ORNL) and a pre-exascale system (Polaris at ANL) show that our generalized algorithms outperform the baseline open-source and proprietary vendor MPI implementations by a significant margin, up to over 4.5x. We empirically determine optimal algorithms and parameter values, identifying where the analytical models are accurate and where hardware features directly determine performance. Most notably, we show how a single, system-agnostic implementation of a generalized algorithm can optimize for multiple hardware/software features across multiple systems.
