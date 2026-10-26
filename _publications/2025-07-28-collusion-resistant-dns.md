---
title: "Collusion Resistant DNS With Private Information Retrieval"
collection: publications
category: preprints
permalink: /publication/2025-07-28-collusion-resistant-dns
excerpt: 'Strengthening DNS privacy with single-server private information retrieval, without non-collusion assumptions.'
date: 2025-07-28
venue: 'arXiv preprint arXiv:2507.20806'
paperurl: 'https://arxiv.org/pdf/2507.20806'
short_venue: 'arXiv 2025 · Preprint'
authors_short: 'Y. Xiao, P. Liu, R. Yu, C. Weng, M. Varvello, A. Kuzmanovic'
highlight: '2× faster than DoH over Tor with similar privacy guarantees.'
citation: 'Yunming Xiao, Peizhi Liu, Ruijie Yu, Chenkai Weng, Matteo Varvello, and Aleksandar Kuzmanovic. "Collusion Resistant DNS With Private Information Retrieval." arXiv preprint arXiv:2507.20806 (2025).'
bibtex: |
  @misc{xiao2025collusion,
    title         = {Collusion Resistant {DNS} With Private Information Retrieval},
    author        = {Xiao, Yunming and Liu, Peizhi and Yu, Ruijie and Weng, Chenkai and Varvello, Matteo and Kuzmanovic, Aleksandar},
    year          = {2025},
    eprint        = {2507.20806},
    archivePrefix = {arXiv},
    primaryClass  = {cs.NI},
    url           = {https://arxiv.org/abs/2507.20806}
  }
---

There has been a growing interest in Internet user privacy, demonstrated by the popularity of privacy-preserving products such as Telegram and Brave, and the widespread adoption of HTTPS. The Domain Name System (DNS) is a key component of Internet-based communication and its privacy has been neglected for years. Recently, DNS over HTTPS (DoH) has improved the situation by fixing the issue of in-path middleboxes. Further progress has been made with proxy-based solutions such as Oblivious DoH (ODoH), which separate a user's identity from their DNS queries. However, these solutions rely on non-collusion assumptions between DNS resolvers and proxies -- an assumption difficult to guarantee in practice. To address this, we explore integrating single-server Private Information Retrieval (PIR) into DNS to enable encrypted query processing without relying on trust assumptions. However, applying PIR to DNS is challenging due to its hierarchical nature -- particularly, interactions with recursive resolvers can still leak information. Navigating performance and privacy trade-offs, we propose PDNS, a DNS extension leveraging single-server PIR to strengthen privacy guarantees. We have implemented a prototype of PDNS and compared its performance against state-of-the-art solutions via trace-driven experiments. The results show that PDNS achieves acceptable performance (2x faster than DoH over Tor with similar privacy guarantees) and strong privacy guarantees today, mainly at the cost of its scalability, which specialized hardware for PIR can address in the near future.
