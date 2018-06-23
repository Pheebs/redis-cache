/** @flow */

import lru from 'redis-lru'

type Cache<T> = {
  set: (key: string, value: T) => Promise<void>,
  get: (key: string) => Promise<T>,
  del: (key: string) => Promise<void>,
  reset: () => Promise<void>,
}

type CreateCacheInput<T> = {
  redis: any,
  getKey: (...args: Array<any>) => string,
  getValue: (...args: Array<any>) => T,
  namespace: string,
  enable: boolean,
  max: number,
}

type CreateCacheOutput<T> = {
  get: (...args: Array<any>) => Promise<T>,
  del: (...args: Array<any>) => Promise<void>,
  reset: () => Promise<void>,
}

function createCache<T>({
  redis,
  getValue,
  getKey,
  namespace,
  enable,
  max,
}: CreateCacheInput<T>): CreateCacheOutput<T> {
  const cache: Cache<T> = lru(redis, { namespace, max })

  const get = async (...args) => {
    if (!enable) {
      return getValue(...args)
    }
    const key = getKey(...args)
    const cachedValue = await cache.get(key)
    if (cachedValue) {
      return cachedValue
    }
    const value = await getValue(...args)
    await cache.set(key, value)
    return value
  }

  const del = async (...args) => {
    if (!enable) {
      return
    }
    const key = getKey(...args)
    await cache.del(key)
  }

  const reset = async () => {
    await cache.reset()
  }

  return { get, del, reset }
}

export default createCache
