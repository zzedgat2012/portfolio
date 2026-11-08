---
title: Modern CSS techniques
summary: Exploring the latest CSS features including Grid, Container Queries, and custom properties for better designs.
publishedOn: 2023-12-28
tags:
  - css
  - frontend
  - responsive
  - web-design
legacyWpId: 13
---
## Modern CSS Techniques

CSS has evolved tremendously. Let's explore modern features that make styling easier and more powerful.

## CSS Grid

Create complex layouts with ease:

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
```

## Container Queries

Style components based on their container size:

```css
@container (min-width: 400px) {
  .card {
    display: flex;
  }
}
```

## CSS Custom Properties

Create maintainable, themeable designs:

```css
:root {
  --primary-color: #007bff;
  --spacing: 1rem;
}

.button {
  background: var(--primary-color);
  padding: var(--spacing);
}
```

## Advanced Selectors

Use modern selectors for cleaner code:

```css
/* :has() selector */
.card:has(img) {
  padding: 0;
}

/* :is() selector */
:is(h1, h2, h3) {
  font-family: 'Fira Code', monospace;
}
```

## Conclusion

Modern CSS provides powerful tools for creating beautiful, responsive designs with less code.
