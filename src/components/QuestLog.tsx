import type { CSSProperties } from 'react'
import { cats as allCats, gameCopy } from '../content'
import { levelFor } from '../logic/progress'
import { tuning } from '../tuning'

export interface QuestLogProps {
  // Pages found, out of the pages that count now.
  pages: number
  total: number
  // Cats ever met, out of every cat (spec §3: the count comes from the cats list).
  cats: number
  xp: number
}

// Design §6: the quest log, always on screen and compact, in Pixelify Sans. The XP bar fills from
// the current level's floor toward the next level: (xp − floor) / (next − floor), full at the top.
export function QuestLog({ pages, total, cats, xp }: QuestLogProps) {
  const { level, floor, next } = levelFor(xp)
  const fill = next === null ? 1 : (xp - floor) / (next - floor)
  const title = gameCopy.levelTitles[level - 1]
  const style = { '--fill': fill, '--bar-ms': `${tuning.quest.barMs}ms` } as CSSProperties
  return (
    <div className="quest-log" style={style}>
      <p className="quest-level">
        <span className="quest-level-number">{gameCopy.level(level)}</span>
        <span className="quest-level-title">{title}</span>
      </p>
      <div
        className="quest-bar"
        role="meter"
        aria-label={`${gameCopy.level(level)}, ${title}`}
        aria-valuemin={floor}
        aria-valuemax={next ?? Math.max(xp, floor)}
        aria-valuenow={xp}
        aria-valuetext={gameCopy.xp(xp)}
      >
        <span className="quest-bar-fill" />
      </div>
      <p className="quest-counts">
        <span className="quest-xp">{gameCopy.xp(xp)}</span>
        <span>{gameCopy.pages(pages, total)}</span>
        <span>{gameCopy.cats(cats, allCats.length)}</span>
      </p>
    </div>
  )
}
