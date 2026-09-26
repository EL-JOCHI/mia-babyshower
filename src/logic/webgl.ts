let webglChecked: boolean | null = null

// Design §2: the 3D world needs WebGL; without it the guest gets the flat room. Checked once.
export function hasWebGL(): boolean {
  if (webglChecked !== null) return webglChecked
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    webglChecked = Boolean(gl)
    try {
      // Release the test context so it does not count against the browser's limit.
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
    } catch {
      // Releasing is only housekeeping.
    }
  } catch {
    webglChecked = false
  }
  return webglChecked
}
