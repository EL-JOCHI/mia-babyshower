// Host-supplied files, detected at build time (§11). A missing file means the feature is absent.
// The gift QR is not detected here: the screen draws it from its payload (content's shared.giftQr),
// and Guardar QR saves the bank's own image, imported where it is used (src/components/Gift.tsx).

const audioFiles = import.meta.glob<string>('./assets/audio/ambience.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const ambienceUrl: string | undefined = Object.values(audioFiles)[0]
