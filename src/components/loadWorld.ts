// The 3D book's chunk (Three.js, React Three Fiber, drei). WorldRoom loads it lazily, and
// src/main.tsx starts the same import at page start for a guest who will get the book: the
// module cache fetches it once.
export const loadWorld = () => import('../world/World')
