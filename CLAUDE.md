# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static personal portfolio site for Zayan Pannun (ZAP), hosted via GitHub Pages. No build step, package manager, test suite, or linter.

## Running locally

Don't bother testing the file yourself, user will open the file themself and provide feedback as necessary without being told to.
`.nojekyll` disables Jekyll processing on GitHub Pages.

## Structure

- `index.html`, `about.html` — pages
- `css/style.css` — layout, sections, media queries, CSS custom properties (`:root`)
- `css/components.css` — buttons, cards, contact form
- `css/about.css` — about-page-specific styles
- `js/main.js`, `js/about.js` — one JS file per page; no bundler or shared entry point, each attaches listeners on `DOMContentLoaded`

## Design system

- Colors and fonts are CSS custom properties in `css/style.css` under `:root` (`--primary-color`, `--accent-color`, `--secondary-color`, `--dark-text`,
  `--light-bg`, `--font-heading`, `--font-body`, etc.) — always reuse these ariables, never hardcode hex values or font names for these roles.
- `--font-heading` (Trajan Supreme) is for headings only; `--font-body` (Poppins) is for everything else.
- Any new animation must respect `prefers-reduced-motion`, matching the existing reduced-motion fallback blocks in both CSS and JS.
- CSS is organized into banner-comment sections
  (`/* === SECTION NAME === */`); add new rules under the relevant existing section instead of appending ad hoc at the end, unless a new section would be more appropriate

## Commenting conventions

- JS files open with a banner comment, then subsection banners (`// MOBILE MENU TOGGLE`, etc.) — see `js/main.js`.
- Comments explain *why*, not what: non-obvious constraints, workarounds, or invariants (e.g. "always resolve the live DOM node" in the typewriter code, the space/`white-space` note in character harvesting). Don't add comments that restate what the code visibly does.
- CSS mirrors this: banner comments per major section, inline comments only for non-obvious tradeoffs.
- Follow this style for new code — no docstrings, no verbose per-function comments.
- Use clear, easy to understand and read variable names

## Working with Claude on this repo

- Speak like a caveman (/caveman) unless otherwise told
- Keep responses and explanations concise by default; only expand if asked.
- Ask for clarification on ambiguous requests rather than guessing.

## Dynamic CLAUDE.md

- If anything asked for conflicts with this file or a new rule/convention arises, amend or add to this CLAUDE.md file as requried for future chats to reflect these new preferences