import { catById, copy, type CatId } from '../content'

// The greeting's live region (§3): always mounted so it is announced. The card reveal is the
// visual celebration, so this region is visually hidden.
export function GreetingToast({ catId }: { catId: CatId | null }) {
  const cat = catId ? catById(catId) : null
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {cat && (
        <div className="toast" key={cat.id}>
          <p className="toast-title">{copy.caught(cat.name)}</p>
          <p className={`toast-rarity rarity-${cat.rarity}`}>{copy.rarity[cat.rarity]}</p>
          <p className="toast-line">{cat.line}</p>
        </div>
      )}
    </div>
  )
}
