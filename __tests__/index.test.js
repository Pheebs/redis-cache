/** @flow */

import Redis from 'redis'
import createCache from '../src/index'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000
const timeout = (ms) => new Promise((res) => setTimeout(res, ms))

describe('cache', () => {
  const redis = Redis.createClient(6379, 'redis')

  it('check a disabled cache', async () => {
    const mockFunc = jest.fn()
    const disabledCache = createCache({
      redis,
      getKey: (a) => a,
      getValue: (key) => {
        mockFunc()
        return `${key}`
      },
      namespace: 'test:disabled',
      enable: false,
      max: 10,
    })
    await disabledCache.reset()
    const a = 'dis'
    await expect(disabledCache.get(a)).resolves.toEqual(`${a}`)
    await expect(disabledCache.get(a)).resolves.toEqual(`${a}`)
    await expect(disabledCache.del(a)).resolves.toBeUndefined()
    await expect(disabledCache.get(a)).resolves.toEqual(`${a}`)
    expect(mockFunc.mock.calls.length).toBe(3)
  })

  it('check an enabled cache', async () => {
    const mockFunc = jest.fn()
    const enabledCache = createCache({
      redis,
      getKey: (a) => a,
      getValue: (key) => {
        mockFunc()
        return `${key}`
      },
      namespace: 'test:enable',
      enable: true,
      max: 10,
    })
    await enabledCache.reset()
    const a = 'en'
    await expect(enabledCache.get(a)).resolves.toEqual(`${a}`)
    await expect(enabledCache.get(a)).resolves.toEqual(`${a}`)
    await expect(enabledCache.del(a)).resolves.toBeUndefined()
    await expect(enabledCache.get(a)).resolves.toEqual(`${a}`)
    expect(mockFunc.mock.calls.length).toBe(2)
  })

  it('check an enabled cache with low capacity', async () => {
    const mockFunc = jest.fn()
    const enabledLowCache = createCache({
      redis,
      getKey: (a) => a,
      getValue: (key) => {
        mockFunc()
        return `${key}`
      },
      namespace: 'test:enable:low',
      enable: true,
      max: 2,
    })
    await enabledLowCache.reset()
    const a = 'en:a'
    const b = 'en:b'
    const c = 'en:c'
    await expect(enabledLowCache.get(a)).resolves.toEqual(`${a}`) // inja
    await expect(enabledLowCache.get(b)).resolves.toEqual(`${b}`) // inja
    await expect(enabledLowCache.get(c)).resolves.toEqual(`${c}`) // inja
    await expect(enabledLowCache.get(a)).resolves.toEqual(`${a}`) // inja
    await timeout(20)
    await expect(enabledLowCache.get(c)).resolves.toEqual(`${c}`)
    expect(mockFunc.mock.calls.length).toBe(4)
  })
})
