# Shop integration (Amazon Fresh / Instacart)

**Status:** draft (post-MVP)
**Last updated:** 2026-05-02
**Owner:** Antonello

## Summary

From the grocery list, let users send ingredients to a delivery service (Amazon Fresh, Instacart) for purchase. The most realistic MVP of this feature is deep-link/search-based — open the service's app or website with each ingredient pre-searched — since neither service offers a public "add to cart" API without a partnership.

**This feature is scoped as post-MVP**, dependent on the grocery list feature (`07-grocery-list.md`).

## User story

> As a user with a grocery list ready, I want to tap "Order on Instacart" and have my ingredients appear as searches in Instacart's app, so I can add them to my cart without retyping everything.

## Approach options (to be decided when prioritized)

| Option | Effort | UX | Dependency |
| --- | --- | --- | --- |
| **Deep link per item** — open Instacart/Amazon Fresh search for each ingredient term | Low | Clunky (opens N tabs/searches) | None |
| **Clipboard export** — copy a formatted list the user pastes into the service | Very low | Manual, but zero integration | None |
| **Instacart affiliate API** — programmatic list-to-cart | Medium | Seamless | Business relationship + API access |
| **AI-normalized product search** — Claude maps "2 cups all-purpose flour" → "King Arthur All-Purpose Flour 5lb" for the user's preferred store | High | Premium feel | AI call + store catalog |

Recommendation: start with **deep link per item** (realistic, no partnership), with **AI-normalized product terms** as an enhancement. The AI normalization can use the same BYO key pattern.

## Ingredient → product mapping

Strip quantities and prep notes, keep the core item:
- "2 cups all-purpose flour, sifted" → search term: "all-purpose flour"
- "1 medium onion, peeled and halved" → search term: "onion"
- "800g whole peeled tomatoes" → search term: "whole peeled tomatoes canned"

Simple heuristic for MVP. AI-powered mapping (Claude call with ingredient list → product search terms) for higher quality.

## Open questions

- **Service availability by region.** Instacart and Amazon Fresh aren't available everywhere. Should we detect locale and show only available services?
- **Partnership interest.** Is there appetite to pursue an Instacart/Amazon affiliate relationship? Changes the feature from a hack to a real integration.
- **Revenue model.** Affiliate links could generate commission. Worth considering if pursuing partnerships.

## Changelog

- 2026-05-02 — initial draft. Scoped as post-MVP. Captured approach options, ingredient-to-product mapping, and open questions.
