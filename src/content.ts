// The content module (requirements §11, BR-2). Every guest-facing string and fact lives here.
// Copy is Spanish and comes verbatim from requirements §6. Code stays English.

export type DayId = 'sat' | 'sun'
export type CatId = 'luz' | 'mimo' | 'susto' | 'bram' | 'nana' | 'chona' | 'chori' | 'minina' | 'misha' | 'kira'
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
  clockTime: '16:30',
  // Spec §2: the Banco Ganadero transfer QR's payload, verbatim, decoded locally from the host's
  // QR (a version-13 code). It holds no readable name or account number. The screen draws it in the
  // invitation's style; Guardar QR saves the bank's own image, src/assets/qr-bank.png, which decodes
  // to this same text (controller ruling 1). The bank's QR expires on 27 September 2027.
  giftQr:
    'OT2Cu6AJdj75fvrf5Cw+Tp66oN98EjzvOGWbFVd9icyzcc3KE9GoUMIQJVnMpmjMFG8TqUumfb2+GMCElZMNIpyHNOVxQ2lfmZpEhz1LD8+241Y83+rRkwh1dIGPGXm5qqnpyJ1f+M62e+rpy9UjVMWB8GNyl8Opslvo1h/rUMTBah8ZjSpOrwQ+40u6I/WTrbAFX2N563XmUcOZMv6LKHtOcVM8Z6VAyZbUYrLgqoFcF5SAusQe5C0D4dmEkiS7RUWYa0KDCRJ8BgkBrFDlVf2n9xhcbAQMZ5MNXA+4SOjQe4pa8VmuZRrR4Pxrx6Xt/eJE6xZCRWG28f9cg3RhJQ==|169CFCA97CD583D173238CAA',
} as const

export const days: Record<DayId, DayRecord> = {
  sat: {
    code: 'n4vk',
    start: '2026-10-17T16:30:00-04:00',
    overFrom: '2026-10-18T00:00:00-04:00',
    dateLine: 'sábado 17 de octubre de 2026',
    whatsappMessage:
      '¡Hola! Quiero confirmar mi asistencia al baby shower de Mia el sábado 17 de octubre a las 16:30.',
  },
  sun: {
    code: 'q8lm',
    start: '2026-10-18T16:30:00-04:00',
    overFrom: '2026-10-19T00:00:00-04:00',
    dateLine: 'domingo 18 de octubre de 2026',
    whatsappMessage:
      '¡Hola! Quiero confirmar mi asistencia al baby shower de Mia el domingo 18 de octubre a las 16:30.',
  },
}

export const cats: readonly CatRecord[] = [
  {
    id: 'luz',
    name: 'Mishona',
    feeling: 'Coquetería',
    rarity: 'comun',
    pages: ['gate', 'invitation'],
    line: 'Se arregla los bigotes antes de saludarte.',
  },
  {
    id: 'mimo',
    name: 'Choni',
    feeling: 'Cariño',
    rarity: 'comun',
    pages: ['gate', 'invitation'],
    line: 'Se acurruca a tu lado y ronronea bajito.',
  },
  {
    id: 'susto',
    name: 'Chavela',
    feeling: 'Temor',
    rarity: 'pocoComun',
    pages: ['gate', 'invitation'],
    line: 'Se asoma cuando el mundo está en calma.',
  },
  {
    id: 'bram',
    name: 'Kiri kiri',
    feeling: 'Juego',
    rarity: 'pocoComun',
    pages: ['invitation'],
    line: 'Tira la púa, la persigue y vuelve por más.',
  },
  {
    id: 'nana',
    name: 'Delilah',
    feeling: 'Curiosidad',
    rarity: 'pocoComun',
    pages: ['invitation'],
    line: 'Todo lo huele primero, hasta el QR.',
  },
  {
    id: 'chona',
    name: 'Chona',
    feeling: 'Energía',
    rarity: 'pocoComun',
    pages: ['invitation'],
    line: 'Llega corriendo y no se queda quieta.',
  },
  {
    id: 'chori',
    name: 'Chori',
    feeling: 'Apapacho',
    rarity: 'pocoComun',
    pages: ['invitation'],
    line: 'Redondita, tranquila y siempre con hambre.',
  },
  {
    id: 'minina',
    name: 'Minina',
    feeling: 'Travesura',
    rarity: 'pocoComun',
    pages: ['invitation'],
    line: 'Pequeñita, blanca y lista para jugar.',
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
  moveHint: 'Desliza para explorar',
  verse: 'Los hijos son una herencia de parte de Jehová.',
  verseCitation: 'Salmo 127:3',
  gift: 'El mayor regalo es poder contar con tu presencia, pero si deseas dar un presente, lo aceptamos con mucho gusto. Puedes usar este QR.',
  qrAlt: 'Código QR para transferir un regalo a Mia',
  qrPending: 'El QR estará aquí pronto.',
  qrSave: 'Guardar QR',
  qrHint: 'Toca el gatito para guardar el QR en tu celular.',
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
  // Spec §4: the Tus gatos badge, cats met out of all of them.
  collectionCount: (n: number, total: number) => `${n}/${total}`,
  close: 'Cerrar',
  greet: 'Saludar',
  greetName: (name: string) => `Saludar a ${name}`,
  caught: (name: string) => `Se quedó contigo: ${name}.`,
  notYet: 'Aún no se acerca',
  roundCount: (n: number, total: number) => `${n} de ${total}`,
  roundNumber: (n: number) => `Vuelta ${n}`,
  playAgain: 'Jugar otra vez',
  doorLine: 'La familia se hace más grande, y nos encantaría que nos acompañes.',
  themeDark: 'Oscuro',
  themeLight: 'Claro',
  countdownLabels: { days: 'Días', hours: 'Horas', minutes: 'Minutos', seconds: 'Segundos' },
  rarity: { comun: 'Común', pocoComun: 'Poco común', legendario: 'Legendario' } satisfies Record<Rarity, string>,
  gate: ['Esta invitación es solo para invitados especiales.', 'Ábrela con el enlace que te enviaron.'],
  a11y: { room: 'Invitación', signposts: 'Ir a', theme: 'Tema' },
  share: { title: 'Baby shower de Mia', description: 'Una invitación para invitados especiales.' },
} as const

// New Spanish copy (design §13): the pages and the game layer, the legendary battle, and the
// gate mini-game (requirements §6).
export const gameCopy = {
  pageFound: '¡Página encontrada!',
  pages: (n: number, total: number) => `Páginas ${n}/${total}`,
  cats: (n: number, total: number) => `Gatos ${n}/${total}`,
  level: (n: number) => `Nivel ${n}`,
  xp: (n: number) => `${n} XP`,
  levelTitles: ['Visitante curioso', 'Amigo de los gatos', 'Guardián del cuento', 'Invitado de honor', 'Leyenda de la casa'],
  levelUp: (n: number) => `¡Subiste a nivel ${n}!`,
  badgeXp: (n: number) => `+${n} XP`,
  badges: {
    openBook: 'Abriste el cuento', palabra: 'La palabra', fecha: 'Guardaste la fecha', lugar: 'Encontraste el lugar',
    sellada: 'Invitación sellada', regalo: 'Encontraste el regalo', qrGuardado: 'QR guardado', puerta: 'Llegaste a la puerta',
    primerGato: 'Tu primer gato', cuentoCompleto: 'Cuento completo', todosLosGatos: 'Todos los gatos',
  },
} as const

export const battleCopy = {
  start: '¡A jugar!',
  intro: (name: string) => `¡${name} quiere jugar!`,
  catBar: 'Energía de juego', youBar: 'Paciencia', you: 'Tú',
  prompt: '¿Qué vas a hacer?',
  moves: { ovillo: 'Lanzar ovillo', mimos: 'Mimos', ronroneo: 'Ronroneo', huir: 'Huir' },
  yourMove: {
    ovillo: (name: string) => `¡Lanzaste el ovillo! ${name} corre tras él.`,
    mimos: (name: string) => `Le diste mimos a ${name}. ¡Ronronea feliz!`,
    ronroneo: (name: string) => `Imitaste un ronroneo. ${name} se relaja…`,
  },
  effective: '¡Es muy efectivo!',
  fled: 'Te fuiste sin hacer ruido.',
  catMoves: {
    misha: ['Misha bosteza…', 'Misha te mira con calma.', 'Misha se estira despacio.', 'Misha amasa una cobija.'],
    kira: ['Kira persigue su cola.', 'Kira hace ojitos.', 'Kira mira una estrella fugaz.', 'Kira salta hacia la puerta.'],
  },
  effectOnYou: 'Tu paciencia baja un poco.',
  safety: (name: string) => `${name} te da un cabezazo cariñoso. ¡Recuperas paciencia!`,
  finisher: { misha: '¡Misha se ha dormido!', kira: '¡Kira se ha echado al suelo!' },
} as const

export const gateGameCopy = {
  start: 'Toca para jugar',
  score: (n: number) => `Puntos ${n}`,
  combo: (n: number) => `Combo ×${n}`,
  seconds: (s: number) => `${s} s`,
  over: '¡Se acabó el tiempo!',
  best: (n: number) => `Tu mejor puntaje: ${n}`,
  record: '¡Nuevo récord!',
} as const
