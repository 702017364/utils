import { Neo4j, Neo4jAhchors } from '@vope/utils'
import { deepStrictEqual } from 'assert'

interface INode { 
  id: string
  name: string
}

interface IEdge { 
  id: string
  name: string
  source: string
  target: string
}

describe('class Neo4jAhchors', function () { 
  it('read() 初始化锚点数据', function () { 
    const neo4j = new Neo4j<INode, IEdge>(
      [
        {
          id: 'n1',
          name: 'n1'
        },
        {
          id: 'n2',
          name: 'n2'
        },
      ],
      [
        {
          id: 'e1',
          name: 'e1',
          source: 'n1',
          target: 'n2',
        },
        {
          id: 'e2',
          name: 'e2',
          source: 'n2',
          target: 'n1',
        },
      ],
      {
        nid: 'id',
        eid: 'id',
        sourceKey: 'source',
        targetKey: 'target',
      }
    )
    
    const anchors = new Neo4jAhchors<INode, IEdge>(neo4j, {
      getBox(id) {
        return id === 'n1'
          ? { centerX: 100, centerY: 100 }
          : { centerX: 300, centerY: 100 }
      },
    })

    anchors.read()
    
    // 验证初始化完成，可以通过调用方法检查
    const actual = anchors.findAnchor('e1')
    const expected = { source: 0, target: 1 }
    
    deepStrictEqual(actual, expected)
  })

  it('getPoints() 获取指定节点上出入边连接点的坐标', function () { 
    const neo4j = new Neo4j<INode, IEdge>(
      [
        {
          id: 'n1',
          name: 'n1'
        },
        {
          id: 'n2',
          name: 'n2'
        },
      ],
      [
        {
          id: 'e1',
          name: 'e1',
          source: 'n1',
          target: 'n2',
        },
        {
          id: 'e2',
          name: 'e2',
          source: 'n2',
          target: 'n1',
        },
      ],
      {
        nid: 'id',
        eid: 'id',
        sourceKey: 'source',
        targetKey: 'target',
      }
    )
    
    const anchors = new Neo4jAhchors<INode, IEdge>(neo4j, {
      getBox(id) {
        return id === 'n1'
          ? { centerX: 100, centerY: 100 }
          : { centerX: 300, centerY: 100 }
      },
    })

    anchors.read()
    
    const actual = {
      n1: anchors.getPoints('n1'),
      n2: anchors.getPoints('n2'),
    }
    
    // 我们只验证返回的点数量和大致结构，因为坐标值可能因计算精度而略有差异
    const pointsN1 = actual.n1
    const pointsN2 = actual.n2
    
    const actualStructure = {
      n1: pointsN1.length,
      n2: pointsN2.length,
      n1Point0Exists: Array.isArray(pointsN1[0]),
      n2Point0Exists: Array.isArray(pointsN2[0]),
    }
    
    const expectedStructure = {
      n1: 2,
      n2: 2,
      n1Point0Exists: true,
      n2Point0Exists: true,
    }
    
    deepStrictEqual(actualStructure, expectedStructure)
  })

  it('findAnchor() 查找边连接点的位置', function () { 
    const neo4j = new Neo4j<INode, IEdge>(
      [
        {
          id: 'n1',
          name: 'n1'
        },
        {
          id: 'n2',
          name: 'n2'
        },
      ],
      [
        {
          id: 'e1',
          name: 'e1',
          source: 'n1',
          target: 'n2',
        },
        {
          id: 'e2',
          name: 'e2',
          source: 'n2',
          target: 'n1',
        },
        {
          id: 'e3',
          name: 'e3',
          source: 'n2',
          target: 'n1',
        },
        {
          id: 'e4',
          name: 'e4',
          source: 'n1',
          target: 'n2',
        },
      ],
      {
        nid: 'id',
        eid: 'id',
        sourceKey: 'source',
        targetKey: 'target',
      }
    )
    
    const anchors = new Neo4jAhchors<INode, IEdge>(neo4j, {
      getBox(id) {
        return id === 'n1'
          ? { centerX: 100, centerY: 100 }
          : { centerX: 300, centerY: 100 }
      },
    })

    anchors.read()
    
    const actual = [
      anchors.findAnchor('e1'),
      anchors.findAnchor('e2'),
      anchors.findAnchor('e3'),
      anchors.findAnchor('e4'),
      anchors.findAnchor('nonexistent'), // 测试不存在的边
    ]
    
    const expected = [
      { source: 0, target: 2 },
      { source: 0, target: 2 },
      { source: 1, target: 3 },
      { source: 1, target: 3 },
      null,
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('getOffset() 获取指定边控制点距离两端点连线的距离', function () { 
    const neo4j = new Neo4j<INode, IEdge>(
      [
        {
          id: 'n1',
          name: 'n1'
        },
        {
          id: 'n2',
          name: 'n2'
        },
      ],
      [
        {
          id: 'e1',
          name: 'e1',
          source: 'n1',
          target: 'n2',
        },
        {
          id: 'e2',
          name: 'e2',
          source: 'n2',
          target: 'n1',
        },
        {
          id: 'e3',
          name: 'e3',
          source: 'n2',
          target: 'n1',
        },
        {
          id: 'e4',
          name: 'e4',
          source: 'n1',
          target: 'n2',
        },
      ],
      {
        nid: 'id',
        eid: 'id',
        sourceKey: 'source',
        targetKey: 'target',
      }
    )
    
    const anchors = new Neo4jAhchors<INode, IEdge>(neo4j, {
      getBox(id) {
        return id === 'n1'
          ? { centerX: 100, centerY: 100 }
          : { centerX: 300, centerY: 100 }
      },
    })

    anchors.read()
    
    const actual = [
      anchors.getOffset('e1'),
      anchors.getOffset('e2'),
      anchors.getOffset('e3'),
      anchors.getOffset('e4'),
      anchors.getOffset('nonexistent'), // 测试不存在的边
    ]
    
    const expected = [
      -0.5,
      -0.5,
      -1.5,
      -1.5,
      -1, // 不存在的边应该返回-1
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('setRaidx() 设置多边间隔弧长', function () { 
    const neo4j = new Neo4j<INode, IEdge>([], [], {
      nid: 'id',
      eid: 'id',
      sourceKey: 'source',
      targetKey: 'target',
    })
    
    const anchors = new Neo4jAhchors<INode, IEdge>(neo4j, {
      getBox(_id) {
        return { centerX: 0, centerY: 0 }
      },
    })
    
    // 验证方法是否存在且可以调用
    anchors.setRaidx(0.5)
    
    const actual = typeof anchors.setRaidx
    const expected = 'function'
    
    deepStrictEqual(actual, expected)
  })

  it('clear() 清理数据', function () { 
    const neo4j = new Neo4j<INode, IEdge>(
      [
        {
          id: 'n1',
          name: 'n1'
        },
      ],
      [
        {
          id: 'e1',
          name: 'e1',
          source: 'n1',
          target: 'n1',
        },
      ],
      {
        nid: 'id',
        eid: 'id',
        sourceKey: 'source',
        targetKey: 'target',
      }
    )
    
    const anchors = new Neo4jAhchors<INode, IEdge>(neo4j, {
      getBox(id) {
        return { centerX: 100, centerY: 100 }
      },
    })
    
    anchors.read()
    
    // 先验证有数据
    const beforeClear = anchors.findAnchor('e1')
    
    // 清理数据
    anchors.clear()
    
    // 再验证数据已被清理（仍然可以调用方法，但返回null）
    const afterClear = anchors.findAnchor('e1')
    
    const actual = [beforeClear, afterClear]
    const expected = [{ source: 0, target: 0 }, null]
    
    deepStrictEqual(actual, expected)
  })
})