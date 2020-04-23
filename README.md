# Software Citation Project
_"Enabling research software engineers to add citability in open source software without hassle."_

_Note: This repository contains server side code written using NodeJS for the [Software Citation Project](https://github.com/sarthak-sehgal/software-citation)_

Software Citation Project is a project aimed at open source software developers who want to enable citability in their software. Open source softwares and packages are widely used and a common problem the developers face is establishing citability to their softwares. Citability is important for researchers for professional as well as personal reasons. It gives them the due credit and recognition. The most common way to enable citation is attaching a DOI through services like [Zenodo](https://zenodo.org) but you would ideally want to attach a [CFF file](https://citation-file-format.github.io) to your software as well. `CITATION.cff` files are plain text files with human- and machine-readable citation information for software. Code developers can include them in their repositories to let others know how to correctly cite their software.

**The "chicken and egg" problem:** The existing workflow does not allow you to incorporate a DOI (using tools like Zenodo and Zotero) and a CITATION.cff easily. Zenodo provides you with a DOI for your software once you release the version and upload the release file on Zenodo. Only after obtaining the DOI can you include it in the CFF file. As a result, your GitHub repository might contain the CFF file but it would not be in the release package (as you released the new version before updating your CFF file).  
The Software Citation Project aims to solve this problem. Using our platform, you can generate a DOI and a CFF file for your upcoming release. Then, once you update the CFF file on your repository, create a release and publish it using Zenodo!

# About
The Software Citation Project started when a group of research software engineers realised that a "chicken and egg" (discussed below) problem exists with citing softwares. The project was discussed in great detail at various sprints and hackathons by researchers and software engineers from all around the globe. The need to solve this problem resonated with the whole community. The project took its shape in the eLife Innovation Leaders 2020 program and is currently managed by Sarthak Sehgal.

