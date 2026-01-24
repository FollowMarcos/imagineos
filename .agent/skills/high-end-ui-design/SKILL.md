---
name: high-end-ui-design
description: Use this to design modern, "Apple-style" high-performance landing pages.
---

# High-End UI Design System

## Visual Philosophy
- **Whitespace**: Use generous padding (`py-24`, `px-8`) to let elements breathe.
- **Bento Grids**: Prefer varied grid layouts (`grid-cols-12`) over simple columns.
- **Depth**: Use `backdrop-blur-md` with subtle borders (`border-white/10`) instead of heavy shadows.
- **Motion**: Every interaction must feel fluid using `motion/react`.

## Component Directives
- **Buttons**: Use subtle gradients or "shimmer" effects. NEVER use default blue buttons.
- **Cards**: Implement "hover:scale-[1.02]" transitions and glassmorphism.
- **Typography**: 
  - Headings: `text-balance`, `tracking-tight`, `font-semibold`.
  - Body: `text-pretty`, `leading-relaxed`, `text-muted-foreground`.

## Forbidden Patterns (AI Slop)
- NO generic "cards with shadows."
- NO bright, saturated gradients.
- NO 100% black `#000` text; use `text-zinc-900` or `text-slate-900`.