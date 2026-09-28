import type { CatId } from '../../../content'
import { bram } from './bram'
import { chona } from './chona'
import { chori } from './chori'
import { kira } from './kira'
import { luz } from './luz'
import { mimo } from './mimo'
import { minina } from './minina'
import { misha } from './misha'
import { nana } from './nana'
import { susto } from './susto'
import type { CatDrawing } from './types'

export type { CatDrawing, CharmKind, Coat, CoatMark, Extra, EyeSpec, Xy } from './types'

export const catDrawings: Record<CatId, CatDrawing> = { luz, mimo, susto, bram, nana, chona, chori, minina, misha, kira }
