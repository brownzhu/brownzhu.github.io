# Kai Zhu's Academic Homepage

This repository contains the source code for [Kai Zhu's personal academic homepage](https://brownzhu.github.io/). The site presents research interests, education, awards, research experience, publications, and contact information in English and Chinese.

本仓库是[朱凯个人学术主页](https://brownzhu.github.io/)的源代码，包含中英文个人简介、研究方向、教育经历、获奖情况、研究经历、论文列表和联系方式。

## Local preview

The site loads Markdown and YAML files with `fetch`, so it should be previewed through a local HTTP server rather than opened directly as a file:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000/>.

## Project structure

```text
.
├── contents/              # English and Chinese content and configuration
│   ├── config.yml         # English labels and site metadata
│   ├── config-zh.yml      # Chinese labels and site metadata
│   ├── home*.md           # Biography, interests, education, and contact
│   ├── awards*.md         # Awards
│   ├── experience*.md     # Research experience
│   └── publications*.md   # Publications
├── static/
│   ├── assets/            # Portrait, background, and favicon
│   ├── css/               # Bootstrap theme and site-specific styles
│   └── js/                # Page logic and vendored browser libraries
├── index.html             # Page structure and metadata
└── LICENSE                # MIT license
```

Files ending in `-zh` are the Chinese versions. The language selector stores the visitor's preference locally and also writes it to the `lang` query parameter.

The desktop layout uses a fixed profile sidebar. Section links update the URL hash and display one content panel at a time; on smaller screens, the sidebar becomes a compact header with a responsive navigation grid.

## Updating the site

1. Edit the corresponding Markdown files in `contents/`.
2. Update navigation labels, page titles, and copyright text in both configuration files.
3. Replace the active portrait and banner images referenced by `index.html` when needed.
4. Preview the site locally and verify both language versions.
5. Push changes to the `main` branch; GitHub Pages serves the repository as a static site.

There is no compilation or package-installation step.

## Attribution and license

The site was adapted from [Yixin Huang's personal homepage template](https://github.com/Yixin0313/personal-homepage-template), which was itself based on [Sen Li's academic homepage](https://github.com/senli1073/senli1073.github.io). The current repository is maintained independently.

The project is available under the [MIT License](LICENSE).
