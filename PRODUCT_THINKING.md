# Product Thinking — Lineage

## 1. What problem were you trying to solve? What type of user did you design for?

I designed for a professional who spends the day inside the tool: an art director or designer producing a campaign for a brand. The demo project is an autumn launch for a candle brand, three days in.

Their problem isn't generating one good image. It's the 300th image. After hours of iterating, the good results are buried in a feed, nobody remembers which prompt and seed produced them, and every new prompt slowly drifts away from the brief. Existing generators treat each prompt as a fresh start and show results as an infinite scroll, so the context of how you got somewhere is lost.

## 2. What are the three most important UX decisions you made? Why?

1. **The project is a family tree, not a feed.** Every take sits in a lane (a branch of exploration), one step to the right of the take it came from. A line connects it to the exact image it grew from. You can always answer "how did I get here?" and go back to any promising direction. I laid the columns out by generation rather than by time, so the canvas stays dense instead of mostly empty.

2. **You change one ingredient, not the whole prompt.** A prompt is stored as a recipe: subject, scene, light, mood and props. Branching means picking one ingredient and giving it a new value. Everything else carries over, so every new take differs from its parent in exactly one deliberate way, and the card shows that difference ("Light: golden hour, was candlelit evening"). The project's Direction (palette, locked ingredients, things to avoid) is added to every prompt automatically, so the campaign stays consistent without retyping.

3. **Deciding is as fast as generating.** Professionals spend more time choosing than creating. Arrow keys move through the canvas. P, X and C pick, reject and compare, and B branches. ⌘K reaches any action or take. Compare shows two to four images with synced zoom so you judge detail, not thumbnails. Picks collect in a Selects tray and export with their recipes, so the hand-off can be reproduced.

## 3. Which features did you intentionally leave out? Why?

- **A free-form node canvas** (like ComfyUI or Krea's node editor). It's powerful, but it turns image-making into wiring diagrams. Lanes give most of the benefit with a fraction of the complexity.
- **Collaboration and comments.** They're important for agencies, but they don't serve one person's core loop: direct, generate, compare, refine, keep.
- **Editing tools** (inpainting, masks). That's a different workspace, FOMI's Image Editing page.
- **AI prompt rewriting.** It hides what changed, which is exactly what this workspace makes visible.
- **Credits, billing, folders and model training.** These are real product needs, but they're noise inside the workspace.
- **Persistence.** Out of scope for a frontend assessment; the state lives in memory.

## 4. Which existing products inspired your thinking? What did you like? What would you improve?

- **Git and Git graph tools:** branches as cheap, visible history. I borrowed the idea, not the jargon.
- **Lightroom and Photo Mechanic:** pick and reject flags with single keys, the professional photographer's culling loop.
- **Cursor and Figma:** ⌘K for everything; diffs that show exactly what changed; a canvas that feels like a working surface.
- **Krea and Magnific:** calm, image-first interfaces. What I'd improve in AI generators generally: results arrive in a feed with no ancestry, settings drift between prompts, and choosing the winners happens somewhere else.

## 5. If you had another month, what would you improve?

- Real persistence and autosave, then **undo** across branches.
- **Merging:** combine ingredients from two branches into one take.
- **Drift warnings:** use a vision model to flag results that ignore the Direction (wrong palette, visible text).
- Shareable review links where a client can pick from the Selects.
- Video takes inside the same lineage.
- Virtualise the canvas for projects with thousands of takes.
- Above all, put it in front of five working designers, watch where they hesitate, and cut whatever they don't use.

## 6. What is the single feature or workflow that differentiates this workspace from existing AI creative platforms?

**Branching by recipe.** Select an image, change one ingredient, and the new take appears in its own lane, connected to the image it came from and labelled with exactly what changed. Every result keeps its full recipe from first take to export.

## 7. Design trade-offs — what was prioritized, simplified, removed, and why

- **Prioritized** the core loop and keyboard speed over breadth. Every element on screen maps to direct, generate, compare, refine or keep.
- **Simplified** the tree into lanes with fixed geometry. Cards and connectors are computed from constants instead of measured, which is easier to read and fast. The cost is less freedom than a free canvas.
- **Simplified** generation to one branch at a time. It avoids queues and partial states, at the cost of some throughput.
- **Removed** a separate history page in Studio, because the lineage is the history.
- **In Part A**, I stayed close to the mockup but changed what didn't work:
  - The Generate button's contrast failed accessibility (2.2:1), so I darkened the coral.
  - The nav indicator follows the active tool rather than sitting on Home.
  - The default ratio is 2:3, to match the mockup's tiles.
  - Tablets use 4 columns, because batches come in 1, 2, 4 or 8 images and 3 columns always left one image alone on a row.
- **Mocked** the backend with curated photo sets matched by keywords. It's not AI, but it makes the results coherent enough to judge the interface honestly.
