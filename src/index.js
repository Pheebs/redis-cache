/** @flow */

import Redis from 'ioredis'
import * as Promise from 'bluebird'

type CreateCacheInput<T> = {
  port: number,
  host: string,
  getKey: (...args: Array<any>) => string,
  getValue: (...args: Array<any>) => T,
  namespace: string,
  enable: boolean,
  ttl: number,
  autoExtend: boolean,
}

type CreateCacheOutput<T> = {
  get: (...args: Array<any>) => Promise<T>,
  del: (...args: Array<any>) => Promise<void>,
  reset: () => Promise<void>,
}

function createCache<T>({
  port,
  host,
  getValue,
  getKey: getKeyHelper,
  namespace,
  enable,
  ttl,
  autoExtend,
}: CreateCacheInput<T>): CreateCacheOutput<T> {
  const redis = new Redis(port, host)
  const getKey = (...args) => `cache:${namespace}:${getKeyHelper(...args)}`

  const get = async (...args) => {
    if (!enable) {
      return getValue(...args)
    }
    const key = getKey(...args)
    const cachedValue = await redis.get(key)
    if (cachedValue) {
      if (autoExtend) {
        await redis.expire(key, ttl)
      }
      const { value } = JSON.parse(cachedValue)
      return value
    }
    const value = await getValue(...args)
    await redis.set(key, JSON.stringify({ value }), 'EX', ttl)
    return value
  }

  const del = async (...args) => {
    if (!enable) {
      return
    }
    const key = getKey(...args)
    await redis.del(key)
  }

  const reset = async () => {
    const keys = await redis.keys(`cache:${namespace}:*`)
    await Promise.map(keys, async (k) => {
      await redis.del(k)
    })
  }

  return { get, del, reset }
}

export default createCache
