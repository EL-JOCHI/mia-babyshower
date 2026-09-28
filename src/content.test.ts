import { describe, expect, it } from 'vitest'
import { catDrawings } from './components/art/cats'
import { catIds, cats, copy, gameCopy } from './content'
import { feelingColors } from './tuning'

// Spec §3: the ten cats, their names, feelings, and lines, verbatim.
describe('the cats (spec §3)', () => {
  it('lists the ten cats with their names, feelings, rarities, and lines', () => {
    expect(cats.map((cat) => [cat.id, cat.name, cat.feeling, cat.rarity, cat.line])).toEqual([
      ['luz', 'Mishona', 'Coquetería', 'comun', 'Se arregla los bigotes antes de saludarte.'],
      ['mimo', 'Choni', 'Cariño', 'comun', 'Se acurruca a tu lado y ronronea bajito.'],
      ['susto', 'Chavela', 'Temor', 'pocoComun', 'Se asoma cuando el mundo está en calma.'],
      ['bram', 'Kiri kiri', 'Juego', 'pocoComun', 'Tira la púa, la persigue y vuelve por más.'],
      ['nana', 'Delilah', 'Curiosidad', 'pocoComun', 'Todo lo huele primero, hasta el QR.'],
      ['chona', 'Chona', 'Energía', 'pocoComun', 'Llega corriendo y no se queda quieta.'],
      ['chori', 'Chori', 'Apapacho', 'pocoComun', 'Redondita, tranquila y siempre con hambre.'],
      ['minina', 'Minina', 'Travesura', 'pocoComun', 'Pequeñita, blanca y lista para jugar.'],
      ['misha', 'Misha', 'Calma', 'legendario', 'Está en calma, y está en casa.'],
      ['kira', 'Kira', 'Asombro', 'legendario', 'Mira la puerta, y se queda cerca.'],
    ])
  })

  it('mixes 2 Común, 6 Poco común, and 2 Legendario', () => {
    const count = (rarity: string) => cats.filter((cat) => cat.rarity === rarity).length
    expect([count('comun'), count('pocoComun'), count('legendario')]).toEqual([2, 6, 2])
  })

  it('keeps three cats at the gate: Mishona, Choni, and Chavela', () => {
    expect(cats.filter((cat) => cat.pages.includes('gate')).map((cat) => cat.id)).toEqual(['luz', 'mimo', 'susto'])
  })

  it('gives every cat art and its own feeling color', () => {
    expect([...catIds].sort()).toEqual(Object.keys(catDrawings).sort())
    const colors = catIds.map((id) => feelingColors[id].toUpperCase())
    expect(new Set(colors).size).toBe(catIds.length)
  })

  it('counts cats out of the whole list, not a fixed seven', () => {
    expect(gameCopy.cats(3, cats.length)).toBe('Gatos 3/10')
    expect(copy.roundCount(3, cats.length)).toBe('3 de 10')
  })
})

// Spec §4 Copy changes, verbatim.
describe('the copy (spec §4)', () => {
  it('has the new family line and the Tus gatos badge', () => {
    expect(copy.doorLine).toBe('La familia se hace más grande, y nos encantaría que nos acompañes.')
    expect(copy.collectionCount(3, cats.length)).toBe('3/10')
  })
})
