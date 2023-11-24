/**
 * 用一维的方式存储二维表
 */
export default class FlexTable<T> { 
  #data: T[][] = []

  /**
   * 行数
   */
  get rowspan() { 
    return this.#data.length
  }

  /**
   * 总数据长度
   */
  get length() { 
    return this.#data.reduce((length, list) => length + list.length, 0)
  }

  constructor() { 
    this.newline()
  }

  /**
   * 创建新行
   */
  newline() { 
    this.#data.push([])
    return this
  }

  push(value: T) { 
    const rowspan = this.#data.length
    rowspan || this.newline()
    this.#data[rowspan - 1].push(value)
    return this
  }

  /**
   * 替换指定位置的数据
   * @description 指定位置必需为有效位置
   */
  replace(rowspan: number, colspan: number, value: T) { 
    const list = this.#data[rowspan]
    list && colspan in list && (list[colspan] = value)
    return this
  }

  /**
   * 从指定位置开始移除或者替换/添加元素
   * @description 指定位置必需为有效位置
   */
  splice(rowspan: number, colspan: number, deleteCount: number, ...values: T[]) { 
    const list = this.#data[rowspan]
    list && colspan in list && list.splice(colspan, deleteCount, ...values)
    return this
  }

  pop(): T | null { 
    const data = this.#data
    const rowspan = data.length
    if (!rowspan) return null
    const list = data[rowspan - 1]
    if (list.length) {
      return list.pop()!
    } else { 
      data.pop()
      return this.pop()
    }
  }

  /**
   * 遍历数据
   */
  each(callback: (value: T, rowspan: number, colspan: number) => boolean | void) { 
    const data = this.#data
    outloop: for (let i = 0; i < data.length; i++) { 
      const list = data[i]
      for (let j = 0; j < list.length; j++) { 
        if(callback(list[j], i, j) === false) break outloop
      }
    }
  }

  /**
   * 反序遍历数据
   */
  reverseEach(callback: (value: T, rowspan: number, colspan: number) => boolean | void) { 
    const data = this.#data
    outloop: for (let i = data.length; i;) {
      const list = data[--i]
      for (let j = list.length; j;) {
        if (callback(list[--j], i, j) === false) break outloop
      }
    }
  }

  /**
   * 清空数据
   */
  clear() { 
    if (this.#data.length) {
      this.#data = []
    }
  }
}