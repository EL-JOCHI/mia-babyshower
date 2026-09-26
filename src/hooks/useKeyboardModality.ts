import { useEffect, useRef } from 'react'

// True after a key press, false after a pointer press. Focus from a tap should not move the camera.
export function useKeyboardModality() {
  const keyboard = useRef(false)
  useEffect(() => {
    const onKey = () => (keyboard.current = true)
    const onPointer = () => (keyboard.current = false)
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('pointerdown', onPointer, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('pointerdown', onPointer, true)
    }
  }, [])
  return keyboard
}
