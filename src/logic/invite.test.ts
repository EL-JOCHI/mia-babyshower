import { describe, expect, it } from 'vitest'
import { resolveInvite } from './invite'

describe('resolveInvite (US-8, BR-9)', () => {
  it('opens Saturday for n4vk and Sunday for q8lm', () => {
    expect(resolveInvite('?e=n4vk')).toEqual({ kind: 'day', day: 'sat' })
    expect(resolveInvite('?e=q8lm')).toEqual({ kind: 'day', day: 'sun' })
  })

  it('returns the gate for a missing, empty, or junk code', () => {
    for (const search of ['', '?', '?e=', '?e=1', '?e=17-octubre', '?x=n4vk', '?e=n4vkx']) {
      expect(resolveInvite(search)).toEqual({ kind: 'gate' })
    }
  })

  it('ignores case, surrounding spaces, and other parameters (US-8 AC6)', () => {
    expect(resolveInvite('?e=N4VK')).toEqual({ kind: 'day', day: 'sat' })
    expect(resolveInvite('?e=%20n4vk%20')).toEqual({ kind: 'day', day: 'sat' })
    expect(resolveInvite('?x=1&e=q8lm')).toEqual({ kind: 'day', day: 'sun' })
  })

  it('reads only the first e parameter', () => {
    expect(resolveInvite('?e=q8lm&e=n4vk')).toEqual({ kind: 'day', day: 'sun' })
  })
})
