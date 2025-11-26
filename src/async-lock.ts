import { isBoolean, isFunction } from 'lodash-es'

interface Bean { 
  get(): boolean,
  set(value: boolean): void
}

interface Accessor { 
  get value(): boolean
  set value(value: boolean)
}

interface Options<V> { 
  /**
   * 满足验证的值将开启锁
   */
  validate?: V | ((data: V) => boolean)

  /**
   * 锁状态
   */
  sp?: Bean | Accessor
}

const isAccessor = (sp?: Bean | Accessor): sp is Accessor => { 
  return sp !== void 0
    && 'value' in sp
    && isBoolean(sp.value)
}

/**
 * 异步锁
 */
export default <const T extends unknown[], V extends unknown>(callback: (...args: T) => Promise<V>, {
  validate,
  sp = { value: false },
}: Options<V> = {}) => {
  const isA = isAccessor(sp)
  const getter = () => isA
    ? sp.value
    : sp.get()
  
  const setter = (value: boolean) => isA
    ? sp.value = value
    : sp.set(value)
  
  let lock = false
  let local!: Promise<V>
  
  return {
    get spin() { 
      return getter()
    },
    async callback(...args: T) { 
      if (getter() || lock) return local
      setter(true)
      local = callback(...args).then((result) => { 
        if (isFunction(validate)) {
          lock = validate(result)
        } else if (validate !== void 0) { 
          lock = validate === result
        }
        return result
      })
      await local
      setter(false)
      return local
    },
    unlock() { 
      lock = false
    },
  }
}