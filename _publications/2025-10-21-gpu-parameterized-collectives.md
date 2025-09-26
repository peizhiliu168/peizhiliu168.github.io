---
title: "Parameterized Algorithms and Parameter Selection for Fast GPU-GPU Collective Communication"
collection: publications
category: conferences
permalink: /publication/2025-10-21-gpu-parameterized-collectives
excerpt: 'Parameterized algorithms and parameter selection for fast GPU-GPU collective communication.'
date: 2025-10-21
venue: '33rd International Symposium on the Modeling, Analysis, and Simulation of Computer and Telecommunication System'
paperurl: '/files/gpu_parameterized_collectives.pdf'
---

High-performance collective communication among GPUs in modern supercomputers is crucial for enabling many applications. Complex hierarchical interconnects between GPU devices necessitate collective algorithms that can effectively leverage the underlying network topology. We present parameterized algorithms for two GPU-to-GPU collectives, Allgather and Allreduce, as well as an optimized permutation kernel used to further enhance GPU collective communication. By employing a LogGP-based model calibrated with real machine measurements, we can efficiently simulate various parameter choices to identify optimal settings for specific device allocations and message sizes. Our comprehensive evaluation on NCSA Delta and Argonne Polaris supercomputers demonstrates that our parameterized algorithms can achieve, on average, a 20% speedup over their non-parameterized counterparts, with our parameter selection process capturing 98% of the potential speedup.
