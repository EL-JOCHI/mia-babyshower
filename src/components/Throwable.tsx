import { useEffect, useState, type ReactNode } from 'react'
import { tuning } from '../tuning'

interface Props {
  children: ReactNode
  className?: string
  // An act elsewhere can knock the toy too (for example Luz batting the heart).
  knocked?: boolean
}

// §3 Throw: a tap knocks the toy a short way, and it comes back to its place.
export function Throwable({ children, className = '', knocked = false }: Props) {
  const [thrown, setThrown] = useState(0)

  useEffect(() => {
    if (!thrown) return
    const id = window.setTimeout(() => setThrown(0), tuning.acts.throwMs)
    return () => window.clearTimeout(id)
  }, [thrown])

  return (
    <span
      className={`throwable ${className}${thrown || knocked ? ' is-thrown' : ''}`}
      aria-hidden="true"
      onClick={() => setThrown((n) => n + 1)}
    >
      {children}
    </span>
  )
}
