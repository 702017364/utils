import type { Equal } from '@type-challenges/utils'
import type { GetGivenProps } from '@vope/types'
import { hash8strings } from './convert/strings'
import type { Memory } from './memory/basic'
import { MemoryList } from './memory/list'
import { MemorySimple } from './memory/simple'

interface Config<INode extends object, IEdge extends object> { 
  /**
   * 点主键字段
   */
  nid: Extract<GetGivenProps<INode, string>, string>
  /**
   * 边主键字段
   */
  eid: Extract<GetGivenProps<IEdge, string>, string>
  /**
   * (边)出点字段
   */
  sourceKey: Extract<GetGivenProps<IEdge, string>, string>
  /**
   * (边)入点字段
   */
  targetKey: Extract<GetGivenProps<IEdge, string>, string>
  /**
   * (边)方向键
   */
  dir?(edge: IEdge): string
}

type Type = 'add' | 'delete'

/**
 * 图管理
 */
export default class Neo4j<INode extends object, IEdge extends object> { 
  #nPrimaryKey: keyof INode
  #ePrimaryKey: keyof IEdge
  #sourceKey: keyof IEdge
  #targetKey: keyof IEdge
  #dirKey: (edge: IEdge) => string

  #nodes: MemorySimple<INode, string>
  #edges: MemorySimple<IEdge, string>
  #sources: MemoryList<IEdge, string>
  #targets: MemoryList<IEdge, string>
  #dirs: MemoryList<IEdge, string>

  get nodeField() { 
    return this.#nPrimaryKey
  }

  get edgeField() { 
    return this.#ePrimaryKey
  }

  get sourceField() { 
    return this.#sourceKey
  }

  get targetField() { 
    return this.#targetKey
  }

  get dirKey() { 
    return this.#dirKey
  }

  /**
   * 点视图
   */
  nodes!: Shield<MemorySimple<INode, string>>

  /**
   * 边视图
   */
  edges!: Shield<MemorySimple<IEdge, string>>

  /**
   * (边)出点视图
   */
  sources!: Shield<MemoryList<IEdge, string>>

  /**
   * (边)入点视图
   */
  targets!: Shield<MemoryList<IEdge, string>>

  /**
   * (边)方向视图
   */
  dirs!: Shield<MemoryList<IEdge, string>>

  constructor(nodeList: INode[], edgeList: IEdge[], { 
    nid,
    eid,
    sourceKey,
    targetKey,
    dir = (edge) => edge[sourceKey] + '|' + edge[targetKey],
  }: Config<INode, IEdge>) { 
    shield(this, 'nodes', this.#nodes = new MemorySimple<INode, string>(<Memory.Pitch<INode, string>><unknown>(this.#nPrimaryKey = nid)))
    shield(this, 'edges', this.#edges = new MemorySimple<IEdge, string>(<Memory.Pitch<IEdge, string>><unknown>(this.#ePrimaryKey = eid)))
    shield(this, 'sources', this.#sources = new MemoryList<IEdge, string>(<Memory.Pitch<IEdge, string>><unknown>(this.#sourceKey = sourceKey)))
    shield(this, 'targets', this.#targets = new MemoryList<IEdge, string>(<Memory.Pitch<IEdge, string>><unknown>(this.#targetKey = targetKey)))
    shield(this, 'dirs', this.#dirs = new MemoryList<IEdge, string>(this.#dirKey = dir))

    nodeList.forEach((node) => this.node('add', node))
    edgeList.forEach((edge) => this.edge('add', edge))
  }

  /**
   * 点操作
   */
  node(type: 'add', value: INode): void
  node(type: 'delete', value: string): IEdge[]
  node(type: Type, value: INode | string) { 
    const nodes = this.#nodes
    if (type === 'add') {
      nodes.push(<INode>value)
    } else if (type === 'delete') { 
      const node = nodes.get(<string>value)
      if (!node) return []
      nodes.delete(node)
      const id = node[this.#nPrimaryKey] as string
      const sourceKey = this.#sourceKey as keyof IEdge
      const targetKey = this.#targetKey as keyof IEdge
      const edges = this.#edges
      const sources = this.#sources
      const targets = this.#targets
      const dirs = this.#dirs
      const list: IEdge[] = []
      sources.get(id)?.reduce((_, edge) => { 
        edges.delete(edge)
        targets.delete(edge)
        edge[sourceKey] === edge[targetKey] || dirs.delete(edge)
        list.push(edge)
        return true
      }, false) && sources.deleteType(id)
      targets.get(id)?.reduce((_, edge) => { 
        edges.delete(edge)
        sources.delete(edge)
        edge[sourceKey] === edge[targetKey] || dirs.delete(edge)
        list.push(edge)
        return true
      }, false) && targets.deleteType(id)
      return list
    }
  }

  /**
   * 边操作
   */
  edge(type: 'add', value: IEdge): void
  edge(type: 'delete', value: string): boolean
  edge(type: Type, value: IEdge | string) {
    const sourceKey = this.#sourceKey as keyof IEdge
    const targetKey = this.#targetKey as keyof IEdge
    const edges = this.#edges
    const sources = this.#sources
    const targets = this.#targets
    const dirs = this.#dirs
    if (type === 'add') {
      const edge = <IEdge>value
      edges.push(edge)
      sources.push(edge)
      targets.push(edge)
      edge[sourceKey] === edge[targetKey] || dirs.push(edge)
    } else if (type === 'delete') { 
      const edge = edges.get(<string>value)
      if (!edge) return false
      edges.delete(edge)
      sources.delete(edge)
      targets.delete(edge)
      edge[sourceKey] === edge[targetKey] || dirs.delete(edge)
      return true
    }
  }

  /**
   * 清理图管理数据
   */
  clear() { 
    this.#nodes.clear()
    this.#edges.clear()
    this.#sources.clear()
    this.#targets.clear()
    this.#dirs.clear()
  }
}

const shield_keys = hash8strings([
  'push',
  'delete',
  'deleteType',
  'clear'
] satisfies Extract<keyof MemorySimple<object, string>, keyof MemoryList<object, string>>[])

type Shield<T> = {
  [P in Exclude<keyof T, keyof typeof shield_keys>]: T[P] extends (...args: infer A) => infer B
    ? Equal<[B], [T]> extends true
      ? (...args: A) => Shield<T>
      : T[P]
    : T[P]
}

const shield = <T extends object, K extends keyof T, O = T[K]>(obj: T, key: K, origin: O) => { 
  const proxy = new Proxy(<Shield<O>>{}, {
    get(target, p) {
      if (p in shield_keys) return
      const value = origin[<keyof O>p]
      if (typeof value === 'function') {
        return function (...args: any): any {
          const result = (<(...args: any) => any>origin[<keyof O>p])(...args)
          return result === origin
            ? proxy
            : result
        }
      } else {
        return value
      }
    },
  })
  Object.defineProperty(obj, key, {
    get() { 
      return proxy
    },
  })
}