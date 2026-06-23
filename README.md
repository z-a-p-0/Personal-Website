# ZAP — Personal Portfolio

A clean, responsive personal portfolio website.

## Structure

```
website/
├── index.html
├── README.md
├── css/
│   ├── style.css        # Layout, sections, media queries, variables
│   └── components.css   # Buttons, cards, contact form
├── js/
│   └── main.js          # Mobile nav, form validation, scroll animations
└── assets/
    ├── icons/
    ├── images/
    └── videos/

```

### Colour Palette

#1DD3B0 - Primary
#FFBA49 - Accent
#9BD31D - Secondary
#292929 - Dark Text
#FFFCF2 - Light Text & Background

### Fonts

Trajan - Headings
Poppins - Rest of Text

## Features

- Sticky responsive navigation with mobile hamburger menu
- Scroll-triggered fade-in animations (respects `prefers-reduced-motion`)
- Contact form with inline validation and feedback (no `alert()`)
- CSS custom properties for easy theming
- Accessible: ARIA attributes, `:focus-visible` styles, semantic HTML

## Customisation

All colours and fonts are defined as CSS variables in `style.css` under `:root`.

## Dev Notes