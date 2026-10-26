---
permalink: /
title: "About me..."
author_profile: true
redirect_from:
  - /about/
  - /about.html
---

I'm a third-year Ph.D. candidate at Northwestern University under Professor Peter Dinda. I am broadly interested in parallel and distributed computing systems. My current research is focused on enhancing the communication and performance of these systems with the use of novel models, mappings, and mechanisms. I am an NSF Graduate Research Fellow.



Publications
======

{% assign pubs = site.publications | sort: "date" | reverse %}
<div class="about-pubs">
{%- for pub in pubs %}
  <p>
    <strong><a href="{{ pub.url | relative_url }}">{{ pub.title }}</a></strong><br>
    {{ pub.authors_short | default: "" | replace: "P. Liu", "<strong>P. Liu</strong>" }}{% if pub.authors_short %}. {% endif %}<em>{{ pub.venue }}</em>, {{ pub.date | date: "%Y" }}.<br>
    {%- if pub.paperurl %} <a href="{{ pub.paperurl | relative_url }}">PDF</a>{% endif %}
    {%- if pub.doi %} · <a href="https://doi.org/{{ pub.doi }}">DOI</a>{% endif %}
  </p>
  {%- if pub.bibtex %}
  <details class="bibtex"><summary>BibTeX</summary><pre><code>{{ pub.bibtex | strip | escape }}</code></pre></details>
  {%- endif %}
{%- endfor %}
</div>

<p><a href="{{ '/publications.bib' | relative_url }}">Download all as a .bib file</a></p>
