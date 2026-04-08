import localforage from 'localforage'
import { isString } from 'lodash-es'
import { type SM4Mode_StringOutput, sm4 } from 'sm-crypto'

const NAME = process.env.npm_config_name

const PREFIX = NAME + '_'

export interface ICrypto<From, To> { 
  encrypt(plain: From): To | Promise<To>
  decrypt(cipher: To): From | Promise<From>
}

interface Options<From, To> { 
  /** 存储名称 */
  name: string
  /** 存储认证 */
  token?: string
  /** 存储期限 */
  expire?: number
  /** 存储加密 */
  crypto: ICrypto<From, To>
}

const key = [0x19, 0x90, 0x01, 0x20, 0x19, 0x87, 0x06, 0x28, 0x20, 0x17, 0x12, 0x13, 0x20, 0x24, 0x09, 0x05]

const iv = [182, 59, 0x09, 29, 86, 64, 118, 111, 112, 101, 47, 117, 116, 105, 108, 115]

const config: SM4Mode_StringOutput = {
  output: 'string',
  mode: 'cbc',
  iv,
}

// @ts-ignore
const HEADER = '.' + sm4.encrypt(NAME, key, config)

interface Head { 
  expire?: number
  token?: string
}

const encrypt = (data: Head) => { 
  let text = ''
  for (const key in data) { 
    const value = data[<keyof Head>key]
    if (value === void 0) continue
    text && (text += '&')
    text += key + ':' + value
  }
  return sm4.encrypt(text, key, config)
}

const decrypt = (text: string) => { 
  const data: Head = {}
  let value: string
  try {
    value = sm4.decrypt(text, key, config)
  } catch { 
    value = ''
  }
  value.split('&').forEach((pair) => { 
    const [key, value] = pair.split(':')
    if (key === 'expire') {
      data[key] = +value
    } else { 
      data[<keyof Head>key] = <any>value
    }
  })
  return data
}

const structKey = (index: number) => index.toString(16).padStart(8, '0')

const reductKey = (key: string) => parseInt(key, 16)

const MESSAGES = {
  mount: 'Please wait for the mounting to complete',
  auth: 'Unauthorized operation',
  push: 'Cannot add data to expired databases',
  update: 'Cannot update data to expired databases',
  get: 'Cannot get data from expired databases',
}

const createInstance = (name: string, version: number = 2) => localforage.createInstance({
  driver: localforage.INDEXEDDB,
  name,
  version,
})

/**
 * 离线存储
 */
export class OfflineStorage<From, To> { 
  #forage: LocalForage

  #expire?: number

  #auth = false

  #crypto!: ICrypto<From, To>

  #size = 0

  #mount: Promise<this>

  #mounted = false

  get size() { 
    return this.#size
  }

  get mounted() { 
    return this.#mounted
  }

  constructor({ 
    name,
    expire: newExpire,
    token: newToken,
    crypto,
  }: Options<From, To>) { 
    const forage = this.#forage = createInstance(sm4.encrypt(PREFIX + name, key, config))
    this.#mount = new Promise<this>(async (resolve) => { 
      const keys = await forage.keys()
        .then((keys) => keys)
        .catch(() => <string[]>[])
      let size = 0
      let expire = newExpire
      let token = newToken
      let auth = true
      for (const key of keys) { 
        if (key === HEADER) {
          const {
            expire: oldExpire,
            token: oldToken,
          } = decrypt((await forage.getItem(key))!)
          expire = oldExpire === void 0
            ? newExpire
            : Date.now() < oldExpire
              ? newExpire
              : oldExpire
          auth = oldToken
            ? oldToken === newToken
            : true
          token = oldToken || newToken
        } else { 
          const value = reductKey(key) + 1
          value > size && (size = value)
        }
      }
      this.#size = size
      this.#expire = expire
      this.#auth = auth
      this.#crypto = crypto
      await forage.setItem<string>(HEADER, encrypt({
        expire,
        token,
      }))
      this.#mounted = true
      resolve(this)
    })
  }

  ready() { 
    return this.#mount
  }

  /**
   * 校验存储是否过期
   */
  validateExpire() { 
    const expire = this.#expire
    return expire === void 0 || Date.now() < expire
  }

  /**
   * 校验
   */
  validate(callback: (error?: Error) => void, expireMessage?: string) { 
    if (!this.#mounted) {
      callback(new Error(MESSAGES.mount))
    } else if (!this.#auth) {
      callback(new Error(MESSAGES.auth))
    } else if (expireMessage && !this.validateExpire()) {
      callback(new Error(expireMessage))
    } else { 
      callback()
    }
  }

  /**
   * 插入数据
   */
  async push(data: From) { 
    this.validate((e) => { 
      if(e) throw e
    }, MESSAGES.push)
    const size = this.#size
    const key = structKey(size)
    await this.#forage.setItem(key, await this.#crypto.encrypt(data))
    return this.#size = size + 1
  }

  /**
   * 修改数据
   */
  async update(index: number, data: From) { 
    this.validate((e) => { 
      if(e) throw e
    }, MESSAGES.update)
    const forage = this.#forage
    const key = structKey(index)
    const value = await forage.getItem<To>(key)
    if (value === null) return false
    await forage.setItem(key, await this.#crypto.encrypt(data))
    return true
  }

  /**
   * 获取数据
   */
  async get(index: number) { 
    this.validate((e) => { 
      if(e) throw e
    }, MESSAGES.get)
    const key = structKey(index)
    const value = await this.#forage.getItem<To>(key)
    return value === null
      ? null
      : await this.#crypto.decrypt(value)
  } 

  /**
   * 清理存储
   */
  async clear() { 
    this.validate((e) => {
      if (e) throw e
    })
    this.#size = 0
    await localforage.dropInstance({
      name: this.#forage.config().name
    })
  }

  static default<T>(options: string | Omit<Options<T, T>, 'crypto'>) { 
    isString(options) && (options = { name: options })
    return new OfflineStorage<T, T>({
      ...options,
      crypto: {
        encrypt(plain) {
          return plain
        },
        decrypt(cipher) {
          return cipher
        },
      },
    })
  }

  static async clear(token?: string, callback?: (name: string) => boolean) { 
    const size = PREFIX.length
    const databases = await indexedDB.databases()
    const tasks: Promise<void>[] = []
    for (const { name, version } of databases) { 
      if (name === void 0) continue
      let text: string
      try {
        text = sm4.decrypt(name, key, config)
      } catch { 
        continue
      }
      if (text.slice(0, size) !== PREFIX) continue
      const forage = createInstance(name, version)
      const value = await forage.getItem<string>(HEADER)
      if (value === null || decrypt(value).token !== token || (callback && callback(text.slice(size)))) continue
      const idb = indexedDB.deleteDatabase(text)
      tasks.push(new Promise<void>((resolve) => { 
        idb.onerror = () => resolve()
        idb.onsuccess = () => resolve()
      }))
    }
    await Promise.all(tasks)
  }
}