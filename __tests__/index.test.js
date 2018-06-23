/** @flow */
import * as Promise from 'bluebird'
import createCache from '../src/index'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000

describe('cache', () => {
  it('check a disabled cache', async () => {
    const mockFunc = jest.fn()
    const disabledCache = createCache({
      port: 6379,
      host: 'redis',
      getKey: (a) => a,
      getValue: (key) => {
        mockFunc()
        return `${key}`
      },
      namespace: 'test:disabled',
      enable: false,
      ttl: 1,
      autoExtend: false,
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
      port: 6379,
      host: 'redis',
      getKey: (a) => a,
      getValue: (key) => {
        mockFunc()
        return `${key}`
      },
      namespace: 'test:enable',
      enable: true,
      ttl: 1,
      autoExtend: false,
    })
    await enabledCache.reset()
    const a = 'en'
    await expect(enabledCache.get(a)).resolves.toEqual(`${a}`)
    await expect(enabledCache.get(a)).resolves.toEqual(`${a}`)
    await expect(enabledCache.del(a)).resolves.toBeUndefined()
    await expect(enabledCache.get(a)).resolves.toEqual(`${a}`)
    expect(mockFunc.mock.calls.length).toBe(2)
  })

  it('check an enabled cache ttl', async () => {
    const mockFunc = jest.fn()
    const enabledLowCache = createCache({
      port: 6379,
      host: 'redis',
      getKey: (a) => a,
      getValue: (key) => {
        mockFunc()
        return `${key}`
      },
      namespace: 'test:enable:low',
      enable: true,
      ttl: 1,
      autoExtend: false,
    })
    await enabledLowCache.reset()
    const a = 'en:a'
    await expect(enabledLowCache.get(a)).resolves.toEqual(`${a}`)
    await Promise.delay(1000)
    await expect(enabledLowCache.get(a)).resolves.toEqual(`${a}`)
    expect(mockFunc.mock.calls.length).toBe(2)
  })

  it('check an enabled cache ttl with auto extend', async () => {
    const mockFunc = jest.fn()
    const enabledLowCache = createCache({
      port: 6379,
      host: 'redis',
      getKey: (a) => a,
      getValue: (key) => {
        mockFunc()
        return `${key}`
      },
      namespace: 'test:enable:low',
      enable: true,
      ttl: 1,
      autoExtend: true,
    })
    await enabledLowCache.reset()
    const a = 'en:a'
    await expect(enabledLowCache.get(a)).resolves.toEqual(`${a}`)
    await Promise.delay(500)
    await expect(enabledLowCache.get(a)).resolves.toEqual(`${a}`)
    await Promise.delay(500)
    await expect(enabledLowCache.get(a)).resolves.toEqual(`${a}`)
    expect(mockFunc.mock.calls.length).toBe(1)
  })
})
