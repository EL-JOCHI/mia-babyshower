import { catById, copy, type CatId } from '../content'

// The visual celebration after a greet (§3). The live region is always mounted so it is announced.
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
