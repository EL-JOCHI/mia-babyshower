// Host-supplied files, detected at build time (§11). A missing file means the feature is absent.

const qrFiles = import.meta.glob<string>('./assets/qr.png', { eager: true, query: '?url', import: 'default' })
const audioFiles = import.meta.glob<string>('./assets/audio/ambience.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const qrImageUrl: string | undefined = Object.values(qrFiles)[0]
export const ambienceUrl: string | undefined = Object.values(audioFiles)[0]
