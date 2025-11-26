import { hash8strings } from './convert/strings'

type Listeners<T> = { 
  [P in keyof T]: T[P][]
}

export type SModel = Record<keyof any, (...args: any[]) => void>

/**
 * 订阅
 */
export default class Subscriber<T extends SModel> { 
  #listeners = {} as Listeners<T>

  #once = {} as Record<keyof T, number[]>
    
  $on<K extends keyof T>(name: K, listener: T[K]) {
    const listeners = this.#listeners
    if (name in listeners) {
      listeners[name].push(listener)
    } else {
      listeners[name] = [listener]
    }
    return this
  }

  $once<K extends keyof T>(name: K, listener: T[K]) { 
    this.$on(name, listener)
    const index = this.#listeners[name].length - 1
    const once = this.#once
    if (name in once) {
      once[name].push(index)
    } else {
      once[name] = [index]
    }
    return this
  }

  $emit<K extends keyof T>(name: K, ...args: Parameters<T[K]>) { 
    const listeners = this.#listeners[name]
    if (!listeners) return this
    const once = hash8strings(this.#once[name] || [])
    this.#listeners[name] = listeners.reduce<T[K][]>((list, listener, index) => { 
      listener(...args)
      index in once || list.push(listener)
      return list
    }, [])
    delete this.#once[name]
    return this
  }

  $off<K extends keyof T>(name: K, listener?: T[K]) { 
    const listeners = this.#listeners
    const once = this.#once
    if (name in listeners === false) return this
    if (listener) {
      let count: number
      listeners[name].some((value, index) => {
        if (value === listener) {
          count = index
          listeners[name].splice(index, 1)
          return true
        }
      }) && once[name]?.some((value, index) => {
        if (value === count) {
          listeners[name].splice(index, 1)
          return true
        }
      })
    } else { 
      delete listeners[name]
      delete this.#once[name]
    }
    return this
  }
}