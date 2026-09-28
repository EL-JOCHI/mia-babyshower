// The 3D book's chunk (Three.js, React Three Fiber, drei). WorldRoom loads it lazily, and
// src/main.tsx starts the same import at page start for a guest who will get the book or the live
// attic: the module cache fetches it once.
export const loadWorld = () => import('../world/World')

// Level 2's live attic (spec §7) ships in the same chunk, so a guest whose book timed out fetches
// nothing new: when the chunk arrives, the attic fades in behind the cards.
export const loadBackdrop = () => loadWorld().then((module) => ({ default: module.Backdrop }))
