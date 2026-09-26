// The content module (requirements §11, BR-2). Every guest-facing string and fact lives here.
// Copy is Spanish and comes verbatim from requirements §6. Code stays English.

export type DayId = 'sat' | 'sun'
export type CatId = 'luz' | 'mimo' | 'susto' | 'bram' | 'nana' | 'misha' | 'kira'
export type Rarity = 'comun' | 'pocoComun' | 'legendario'
export type CatPage = 'gate' | 'invitation'

export interface DayRecord {
  code: string
  start: string
  overFrom: string
  dateLine: string
  whatsappMessage: string
}

export interface CatRecord {
  id: CatId
  name: string
  feeling: string
  rarity: Rarity
  pages: readonly CatPage[]
  line: string
}

export const shared = {
  whatsappNumber: '59176632451',
  place: 'Av. Prolongación Beni (Entre 6to y 7mo anillo). Calle 12 de Abril S/N',
  city: 'Santa Cruz de la Sierra, Bolivia',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=-17.73170923809386,-63.15786528996242',
  timezone: 'America/La_Paz',
  clockTime: '16:00',
} as const

export const days: Record<DayId, DayRecord> = {
  sat: {
    code: 'n4vk',
    start: '2026-10-17T16:00:00-04:00',
    overFrom: '2026-10-18T00:00:00-04:00',
    dateLine: 'sábado 17 de octubre de 2026',
    whatsappMessage:
      '¡Hola! Quiero confirmar mi asistencia al baby shower de Mia el sábado 17 de octubre a las 16:00.',
  },
  sun: {
    code: 'q8lm',
    start: '2026-10-18T16:00:00-04:00',
    overFrom: '2026-10-19T00:00:00-04:00',
    dateLine: 'domingo 18 de octubre de 2026',
    whatsappMessage:
      '¡Hola! Quiero confirmar mi asistencia al baby shower de Mia el domingo 18 de octubre a las 16:00.',
  },
}

export const cats: readonly CatRecord[] = [
  {
    id: 'luz',
    name: 'Luz',
    feeling: 'Alegría',
    rarity: 'comun',
    pages: ['gate', 'invitation'],
    line: 'Siempre encuentra algo que perseguir.',
  },
  {
    id: 'mimo',
    name: 'Mimo',
    feeling: 'Ternura',
    rarity: 'comun',
    pages: ['gate', 'invitation'],
    line: 'Le gusta que te quedes un rato.',
  },
  {
    id: 'susto',
    name: 'Susto',
    feeling: 'Temor',
    rarity: 'pocoComun',
    pages: ['gate', 'invitation'],
    line: 'Se asoma cuando el mundo está en calma.',
  },
  {
    id: 'bram',
    name: 'Bram',
    feeling: 'Ímpetu',
    rarity: 'pocoComun',
    pages: ['invitation'],
    line: 'Hace ruido y después se queda.',
  },
  {
    id: 'nana',
    name: 'Nana',
    feeling: 'Delicadeza',
    rarity: 'pocoComun',
    pages: ['invitation'],
    line: 'Elige un solo lugar, y ese es el suyo.',
  },
  {
    id: 'misha',
    name: 'Misha',
    feeling: 'Calma',
    rarity: 'legendario',
    pages: ['invitation'],
    line: 'Está en calma, y está en casa.',
  },
  {
    id: 'kira',
    name: 'Kira',
    feeling: 'Asombro',
    rarity: 'legendario',
    pages: ['invitation'],
    line: 'Mira la puerta, y se queda cerca.',
  },
]

export const catIds: readonly CatId[] = cats.map((cat) => cat.id)

export function catById(id: CatId): CatRecord {
  const cat = cats.find((c) => c.id === id)
  if (!cat) throw new Error(`Unknown cat: ${id}`)
  return cat
}

export const copy = {
  title: 'Baby shower de Mia',
  hero: 'Mia ya es nuestra princesa. Nos haría muy feliz celebrar su llegada contigo.',
  postPartyHero: 'Gracias por celebrar con nosotros la llegada de Mia.',
  relive: 'La fiesta ya pasó, pero los gatos siguen aquí. Revive el momento.',
  musicOn: 'Activar música',
  musicOff: 'Silenciar música',
  moveHint: 'Muévete para explorar',
  verse: 'Los hijos son una herencia de parte de Jehová.',
  verseCitation: 'Salmo 127:3',
  giftLead: 'Lo más importante es que vengas.',
  giftOffer: 'Si quieres tener un detalle, puedes transferir con este QR. El monto lo eliges tú.',
  qrAlt: 'Código QR para transferir un regalo a Mia',
  qrPending: 'El QR estará aquí pronto.',
  qrSave: 'Guardar QR',
  confirm: 'Confirmar por WhatsApp',
  map: 'Ver en el mapa',
  signposts: {
    llegada: 'Inicio',
    cuando: 'La fecha',
    donde: 'El lugar',
    confirmar: 'Confirmar',
    presente: 'El regalo',
    familia: 'La familia',
  },
  collection: 'Tus gatos',
  close: 'Cerrar',
  greet: 'Saludar',
  greetName: (name: string) => `Saludar a ${name}`,
  caught: (name: string) => `Se quedó contigo: ${name}.`,
  notYet: 'Aún no se acerca',
  roundCount: (n: number) => `${n} de 7`,
  roundNumber: (n: number) => `Vuelta ${n}`,
  playAgain: 'Jugar otra vez',
  doorLine: 'Papá, mamá, Miguelito y Mia. Misha y Kira vienen con ellos.',
  themeDark: 'Oscuro',
  themeLight: 'Claro',
  countdownLabels: { days: 'Días', hours: 'Horas', minutes: 'Minutos', seconds: 'Segundos' },
  rarity: { comun: 'Común', pocoComun: 'Poco común', legendario: 'Legendario' } satisfies Record<Rarity, string>,
  gate: ['Esta invitación es solo para invitados especiales.', 'Ábrela con el enlace que te enviaron.'],
  a11y: { room: 'Invitación', signposts: 'Ir a', theme: 'Tema' },
  share: { title: 'Baby shower de Mia', description: 'Una invitación para invitados especiales.' },
} as const
