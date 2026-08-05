---
title: 'Examples'
sidebar_label: 'Examples'
sidebar_position: 3
---

# Examples

Every example here is **tiny and solves exactly one problem**. No mega demo app, no boilerplate to wade through — each page shows a real use case in the fewest lines that still make the point. The full runnable sources live in [`src/examples/`](https://github.com/priolo/jon/tree/master/src/examples).

A note on imports: the snippets import from `@priolo/jon`. If you [copy-pasted](/docs/why) `rvx_juice.ts` instead, import from your local file — same API. Pages that need the full library (watchers, lifecycle hooks) say so explicitly.

## The basics

- [Counter](/docs/examples/counter) — the hello world: one store, one component.
- [Store instances](/docs/examples/store-instances) — one setup, many stores: an array of window components, each with its own instance.
- [Async fetch](/docs/examples/async-fetch) — loading / data / error, the canonical async pattern.

## Rendering, only when it matters

- [Conditional render](/docs/examples/conditional-render) — re-render a component only when *its* data changes.
- [Nested render](/docs/examples/nested-render) — predicates + `memo` in a component hierarchy.
- [List rows](/docs/examples/list-rows) — update one row of a list without touching the others.

## Real-world jobs for a store

- [Router](/docs/examples/router) — client-side routing with params, no router library.
- [Persist](/docs/examples/persist) — save and restore state from `localStorage`.
- [Mix stores](/docs/examples/mix-stores) — compose setups like classes: a generic "persistent" base + the real properties.
- [Validator form](/docs/examples/validator-form) — declarative field validation.
- [Watch stores](/docs/examples/watch-stores) — two decoupled stores that react to each other.
