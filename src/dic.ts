import type { IsNever, PartialRecord, Revise } from '@vope/types'
import { isFunction } from 'lodash-es'
import { hash8json } from './convert/json'
import { hash8strings } from './convert/strings'

type Key = string | number

export interface Dic<V extends Key> { 
  label: string
  value: V
}

type CustomLabel<T, M extends string> = ((data: T) => string) | Record<M, (data: T) => string>

interface Options<K extends Key, T extends Dic<K>, M extends string> { 
  defaultValue?: K
  customLabel?: CustomLabel<T, M>
}

/**
 * 字典操作
 */
class DicRollup<K extends Key, T extends Dic<K> = Dic<K>, Mode extends string = never> { 
  #list: T[]

  #default?: K

  #customLabel?: CustomLabel<T, Mode>

  protected readonly memory!: Record<K, T>

  constructor(list: T[], {
    defaultValue,
    customLabel,
  }: Options<K, T, Mode> = {}) { 
    this.#list = list
    this.#default = defaultValue
    this.#customLabel = customLabel

    const getter = () => hash8json(list, 'value')

    Object.defineProperty(this, 'memory', {
      get() {
        return getter()
      },
    })
  }

  get size() { 
    return this.#list.length
  }

  get default() { 
    return this.#default
  }

  get list() { 
    return this.#list
  }

  includes(key: Key): key is K { 
    return key in this.memory
  }

  label(key: K, mode?: Mode) { 
    const data = this.memory[key]
    if (!data) return
    const custom = this.#customLabel
    if (!custom) return data.label
    if (!mode && isFunction(custom)) {
      return custom(data)
    } else if (mode) {
      const tmp = (custom as unknown as PartialRecord<Mode, (data: T) => string>)[mode]
      return tmp
        ? tmp(data)
        : data.label
    } else { 
      return data.label
    }
  }

  get<P extends keyof T>(key: K, property: P) { 
    return this.memory[key]?.[property]
  }

  item(key: K): Readonly<T> { 
    return this.memory[key]
  }

  map<V>(callback: (data: Readonly<T>, index: number) => V) { 
    return this.#list.map(callback)
  }

  reduce<V>(callback: (previousValue: V, currentValue: T, currentIndex: number) => V, initialValue: V) { 
    return this.#list.reduce<V>(callback, initialValue)
  }

  copy<P extends K, M extends string = never>(keys: P[], options?: Options<P, Readonly<Revise<T, 'value', P>>, M>) { 
    type Dic = Revise<T, 'value', P>
    const tmp = hash8strings(keys)
    const opts = Object.assign({
      defaultValue: this.#default,
      customLabel: this.#customLabel,
    } satisfies Readonly<Options<K, T, Mode>>, options)
    const { defaultValue } = opts
    if (defaultValue !== void 0 && defaultValue in tmp === false) { 
      opts.defaultValue = void 0
    }
    type V = IsNever<M> extends true ? Mode : M
    return new DicRollup<P, Dic, V>(
      this.#list.filter((data) => data.value in tmp) as Dic[],
      opts as Options<P, Dic, V>
    )
  }

  copyAnti<P extends K, M extends string = never>(keys: P[], options?: Options<Exclude<K, P>, Readonly<Revise<T, 'value', Exclude<K, P>>>, M>) { 
    type KK = Exclude<K, P>
    type Dic = Revise<T, 'value', KK>
    const tmp = hash8strings(keys)
    const opts = Object.assign({
      defaultValue: this.#default,
      customLabel: this.#customLabel,
    } satisfies Readonly<Options<K, T, Mode>>, options)
    const { defaultValue } = opts
    if (defaultValue !== void 0 && defaultValue in tmp) { 
      opts.defaultValue = void 0
    }
    type V = IsNever<M> extends true ? Mode : M
    return new DicRollup<KK, Dic, V>(
      this.#list.filter((data) => data.value in tmp === false) as Dic[],
      opts as Options<KK, Dic, V>
    )
  }
}

namespace DicRollup { 
  export type Type<T extends DicRollup<any, any, string>> = T extends DicRollup<infer K, any, string>
    ? K
    : never
  
  export type Dic<T extends DicRollup<any, any, string>> = T extends DicRollup<any, infer V, string>
    ? V
    : never
  
  export type Mode<T extends DicRollup<any, any, string>> = T extends DicRollup<any, any, infer M>
    ? M
    : never
}

export default DicRollup