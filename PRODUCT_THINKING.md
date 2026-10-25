# Product Thinking

## 1. What problem were you trying to solve? What type of user did you design for?

Designers who make images all day for a client. Think a campaign for a candle brand.

The problem: after 200 images you can't find the good ones, and you forget which prompt made them. Most tools just show one long feed, so you lose track fast.

## 2. What are the three most important UX decisions you made? Why?

1. **Branches, not a feed.** Each new set of images sits next to the one it came from, with a line between them. So you can always see how you got somewhere and go back.

2. **Change one thing at a time.** The prompt is split into parts: subject, scene, light, mood, props. To try something new you change one part and keep the rest. The card shows what changed, like "Light: golden hour". The brand rules get added to every prompt by themselves, so you don't type them again.

3. **Fast picking.** Choosing takes longer than making. So there are shortcuts: arrows to move, P to pick, X to reject, C to compare, B to branch, ⌘K for everything else. Picks go to a tray and you can export them with their prompts.

## 3. Which features did you intentionally leave out? Why?

- **Node editor** (like ComfyUI). Too complex for most people. Lanes are simpler.
- **Comments and sharing.** Useful for teams, but not needed to make and pick images.
- **Editing tools** like masks. That's a different page.
- **AI prompt rewriting.** It hides what changed, and seeing changes is the whole point.
- **Saving to a database.** Out of scope for a frontend task. Everything resets on reload.

## 4. Which existing products inspired your thinking? What did you like? What would you improve?

- **Higgsfield:** images fill the screen and the prompt bar sits at the bottom. Liked that the images come first. Would improve: it's one long feed, so it's hard to tell which settings made which image.
- **Krea:** very clean, a few chips under the prompt instead of big menus. Liked how simple it feels. Would improve: older results get lost as you keep going.
- **Magnific and OpenArt:** settings panel on the left, results on the right. Liked that every setting is easy to find. Would improve: a lot of options on screen at once.
- **Leonardo:** good presets and models to start from. Would improve: lots of menus to dig through.

Outside AI tools: branches from **Git**, pick and reject keys from **Lightroom**, ⌘K from **Cursor** and **Figma**.

## 5. If you had another month, what would you improve?

- Save projects and add undo
- Mix two branches into one
- Warn when an image breaks the brand rules (wrong colours, text in the image)
- Share links so a client can pick images
- Video branches
- Test with real designers and remove what they don't use

## 6. What is the single feature or workflow that differentiates this workspace from existing AI creative platforms?

Branching. Pick an image, change one thing, and you get a new set right next to it, with a note saying what changed. Every image keeps its full recipe till export.

## 7. Design trade-offs: what did you prioritize, simplify and remove, and why?

- **Prioritized:** the main loop (make, compare, pick) and keyboard speed.
- **Simplified:** fixed lanes instead of a free canvas. Easier to read, less freedom.
- **Simplified:** one branch generates at a time. No queue to manage.
- **Removed:** a separate history page in the studio. The branches already are the history.
- **Part A changes from the mockup:**
  - Generate button colour made darker, the original was hard to read
  - Nav highlight follows Image or Video
  - Default ratio 2:3 to match the mockup images
  - 4 columns on tablet so image sets don't leave one alone on a row
- **Fake backend:** picks stock photos by keywords. Not real AI, but good enough to test the UI.
