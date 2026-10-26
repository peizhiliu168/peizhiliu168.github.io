---
title: "Parameterized Algorithms and Parameter Selection for Fast GPU-GPU Collective Communication"
collection: publications
category: conferences
permalink: /publication/2025-10-21-gpu-parameterized-collectives
excerpt: 'Parameterized algorithms and parameter selection for fast GPU-GPU collective communication.'
date: 2025-10-21
venue: '2025 33rd International Symposium on Modeling, Analysis and Simulation of Computer and Telecommunication Systems (MASCOTS)'
paperurl: '/files/gpu_parameterized_collectives.pdf'
short_venue: 'MASCOTS 2025 · Paris'
authors_short: 'P. Liu, S. Rhee, M. Wilkins, P. Dinda'
doi: '10.1109/MASCOTS67699.2025.11283230'
highlight: 'A <span class="stat">20%</span> average speedup; parameter selection captures 98% of the gain.'
citation: 'Peizhi Liu, Sean Rhee, Michael Wilkins, and Peter Dinda. "Parameterized Algorithms and Parameter Selection for Fast GPU-GPU Collective Communication." In 2025 33rd International Symposium on Modeling, Analysis and Simulation of Computer and Telecommunication Systems (MASCOTS), pp. 1-9. IEEE, 2025. doi: 10.1109/MASCOTS67699.2025.11283230.'
bibtex: |
  @inproceedings{liu2025parameterized,
    title     = {Parameterized Algorithms and Parameter Selection for Fast {GPU-GPU} Collective Communication},
    author    = {Liu, Peizhi and Rhee, Sean and Wilkins, Michael and Dinda, Peter},
    booktitle = {2025 33rd International Symposium on Modeling, Analysis and Simulation of Computer and Telecommunication Systems (MASCOTS)},
    pages     = {1--9},
    year      = {2025},
    address   = {Paris, France},
    publisher = {IEEE},
    doi       = {10.1109/MASCOTS67699.2025.11283230}
  }
---

High-performance collective communication among GPUs in modern supercomputers is crucial for enabling many applications. Complex hierarchical interconnects between GPU devices necessitate collective algorithms that can effectively leverage the underlying network topology. We present parameterized algorithms for two GPU-to-GPU collectives, Allgather and Allreduce, as well as an optimized permutation kernel used to further enhance GPU collective communication. By employing a LogGP-based model calibrated with real machine measurements, we can efficiently simulate various parameter choices to identify optimal settings for specific device allocations and message sizes. Our comprehensive evaluation on NCSA Delta and Argonne Polaris supercomputers demonstrates that our parameterized algorithms can achieve, on average, a 20% speedup over their non-parameterized counterparts, with our parameter selection process capturing 98% of the potential speedup.
