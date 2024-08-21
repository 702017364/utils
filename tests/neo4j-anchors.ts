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

  it('getPoints()', function () { 
    deepStrictEqual({
      n1: anchors.getPoints('n1'),
      n2: anchors.getPoints('n2'),
    }, {
      n1: [
        [0.993908891908236, 0.577807496386778],
        [0.9460668496834972, 0.7258857357458419],
        [0.993908891908236, 0.42219250361322197],
        [0.9460668496834972, 0.2741142642541581]
      ],
      n2: [
        [0.0060911080917640525, 0.4221925036132219],
        [0.05393315031650281, 0.2741142642541581],
        [0.0060911080917640525, 0.5778074963867781],
        [0.05393315031650281, 0.7258857357458419]
      ]
    })
  })

  it('findAnchor()', function () { 
    deepStrictEqual(
      [
        anchors.findAnchor('e1'),
        anchors.findAnchor('e2'),
        anchors.findAnchor('e3'),
        anchors.findAnchor('e4'),
      ],
      [
        { source: 0, target: 2 },
        { source: 0, target: 2 },
        { source: 1, target: 3 },
        { source: 1, target: 3 },
      ]
    )
  })

  it('getOffset()', function () { 
    deepStrictEqual(
      [
        anchors.getOffset('e1'),
        anchors.getOffset('e2'),
        anchors.getOffset('e3'),
        anchors.getOffset('e4'),
      ],
      [-0.5, -0.5, -1.5, -1.5]
    )
  })
})