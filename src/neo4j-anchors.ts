import Neo4j from './neo4j'
import { rotateRad } from './rotate/rad'

interface IBox { 
  centerX: number
  centerY: number
}

interface Anchor { 
  source: number
  target: number
}

interface Config { 
  radOffsetRaidx?: number
  getBox(id: string): IBox
}

/**
 * 图布局之二阶贝塞尔曲线边锚点管理
 */
export default class Neo4jAhchors<INode extends object, IEdge extends object> { 
  protected config: Config
  #anchors: Record<string, Anchor> = {}

  constructor(protected neo4j: Neo4j<INode, IEdge>, config: Config) { 
    this.config = Object.assign({}, config)
  }

  protected getDir(start: string, end: string) { 
    const { neo4j} = this
    return neo4j.dirKey(<IEdge>{
      [neo4j.sourceField]: start,
      [neo4j.targetField]: end
    })
  }

  /**
   * 当图数据准备好后调用
   */
  read() { 
    const { neo4j } = this
    const { nodeField, edgeField, sourceField, targetField } = neo4j
    const anchors: Record<string, Anchor> = {}
    neo4j.nodes.forEach((node) => { 
      const nodeId = node[nodeField] as string
      let count = 0;
      [
        neo4j.sources.get(nodeId),
        neo4j.targets.get(nodeId)
      ].forEach((list, i) => { 
        if (!list) return
        let diffCount = 0
        let sameCount = 0
        list.forEach((edge) => { 
          const edgeId = edge[edgeField] as string
          if (edge[sourceField] !== edge[targetField]) { 
            const anchor = anchors[edgeId] || (anchors[edgeId] = <Anchor>{})
            anchor[i ? 'target' : 'source'] = count + diffCount++
          } else if(edgeId in anchors === false) {
            anchors[edgeId] = {
              source: sameCount,
              target: sameCount++,
            }
          }
        })
        count += diffCount
      })
    })
    this.#anchors = anchors
  }

  protected calcPoints(edge: IEdge, index: number, total: number, type: 1 | -1) { 
    const { neo4j, config: { getBox, radOffsetRaidx = .3125 } } = this
    const source = getBox(edge[neo4j.sourceField] as string)
    const target = getBox(edge[neo4j.targetField] as string)
    const rad = Math.atan2(
      (source.centerY - target.centerY) * type,
      (source.centerX - target.centerX) * type,
    )
    let point = rotateRad([.5, 0], rad)
    if (total !== 1) {
      point = rotateRad(point, radOffsetRaidx * (total / 2 - .5 - index))
    }
    const [x, y] = point
    return [x + .5, .5 - y]
  }

  /**
   * 获取指定节点上出入边连接点的坐标
   */
  getPoints(id: string) { 
    const { neo4j } = this
    const { dirs, edgeField, sourceField, targetField } = neo4j
    const anchors = this.#anchors
    const points: number[][] = []
    const caches: Record<string, string> = {}
    neo4j.sources.get(id)?.forEach((edge) => { 
      const source = edge[sourceField] as string
      const target = edge[targetField] as string
      const direct = this.getDir(source, target)
      const invert = this.getDir(target, source)
      if (direct in caches) return
      const directs = dirs.get(direct) || []
      const inverts = dirs.get(invert) || []
      const directsLength = directs.length
      const invertsLength = inverts.length
      const total = directsLength + invertsLength
      directs.forEach((data, index) => {
        points[anchors[data[edgeField] as string].source] = this.calcPoints(data, directsLength - 1 - index, total, -1)
      })
      caches[direct] = direct
    })
    neo4j.targets.get(id)?.forEach((edge) => {
      const source = edge[sourceField] as string
      const target = edge[targetField] as string
      const direct = this.getDir(source, target)
      const invert = this.getDir(target, source)
      if (direct in caches) return
      const directs = neo4j.dirs.get(direct) || []
      const inverts = neo4j.dirs.get(invert) || []
      const directsLength = directs.length
      const invertsLength = inverts.length
      const total = directsLength + invertsLength
      directs.forEach((data, index) => {
        points[anchors[data[edgeField] as string].target] = this.calcPoints(data, invertsLength + index, total, 1)
      })
      caches[direct] = direct
    })
    return points
  }

  /**
   * 查找边连接点的位置
   */
  findAnchor(id: string) { 
    const anchor = this.#anchors[id] || {}
    return {
      source: anchor.source || 0,
      target: anchor.target || 0,
    }
  }

  /**
   * 获取指定边控制点距离两端点连线的距离(可理解为控制边的弯曲程度)
   * @description 返回值是一个相对值，需要乘以一个基数值(基数值应为负值，如-30)
   */
  getOffset(id: string) { 
    const { neo4j } = this
    const edge = neo4j.edges.get(id)
    if (!edge) return -1
    const { dirs, edgeField, sourceField, targetField } = neo4j
    const source = edge[sourceField] as string
    const target = edge[targetField] as string
    const directs = dirs.get(this.getDir(source, target)) || []
    const inverts = dirs.get(this.getDir(target, source)) || []
    let count = 0
    let index = 0;
    [directs, inverts].some((list) => {
      const result = list.some((data, i) => {
        if (data[edgeField] === id) {
          index = i + count
          return true
        }
      })
      count += list.length
      return result
    })
    const directsSize = directs.length
    const invertsSize = inverts.length
    const total = directsSize + invertsSize
    if (total === 1) return -1
    if (directsSize === 0 || invertsSize === 0) {
      return total / 2 - index - .5
    } else {
      return Math.abs(directsSize - invertsSize) * (directsSize >= invertsSize ? 1 : -1) / 2 - index - .5
    }
  }

  /**
   * 清理数据
   */
  clear() { 
    this.#anchors = {}
  }
}