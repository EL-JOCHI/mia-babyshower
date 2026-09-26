import type { CatId } from '../../../content'
import { bram } from './bram'
import { kira } from './kira'
import { luz } from './luz'
import { mimo } from './mimo'
import { misha } from './misha'
import { nana } from './nana'
import { susto } from './susto'
import type { CatDrawing } from './types'

export type { CatDrawing, CharmKind, Extra, EyeSpec, Xy } from './types'

export const catDrawings: Record<CatId, CatDrawing> = { luz, mimo, susto, bram, nana, misha, kira }
