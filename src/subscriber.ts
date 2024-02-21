type Listeners<T> = { 
  [P in keyof T]: T[P][]
}

/**
 * 订阅
 */
export default class Subscriber<T extends Record<string, (...args: any[]) => void>> { 
  #listeners = {} as Listeners<T>

  $on<K extends keyof T>(name: K, listener: T[K]) {
    const listeners = this.#listeners
    if (name in listeners) {
      listeners[name].push(listener)
    } else {
      listeners[name] = [listener]
    }
    return this
  }

  $emit<K extends keyof T>(name: K, ...args: Parameters<T[K]>) { 
    this.#listeners[name]?.forEach((listener) => listener(...args))
    return this
  }

  $off<K extends keyof T>(name: K, listener?: T[K]) { 
    const listeners = this.#listeners
    if (name in listeners === false) return this
    if (listener) {
      listeners[name].some((value, index) => {
        if (value === listener) {
          listeners[name].splice(index, 1)
          return true
        }
      })
    } else { 
      delete listeners[name]
    }
    return this
  }
}