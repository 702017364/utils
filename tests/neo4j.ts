import { Neo4j } from '@vope/utils'
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

describe('class Neo4j', function () { 
  const neo4j = new Neo4j<INode, IEdge>([
    {
      id: 'n1',
      name: 'node-1'
    },
    {
      id: 'n2',
      name: 'node-2'
    },
  ], [
    {
      id: 'e1',
      name: 'edge-1',
      source: 'n1',
      target: 'n2'
    },
    {
      id: 'e2',
      name: 'edge-2',
      source: 'n2',
      target: 'n1'
    },
    {
      id: 'e3',
      name: 'edge-3',
      source: 'n1',
      target: 'n1'
    },
    {
      id: 'e4',
      name: 'edge-4',
      source: 'n2',
      target: 'n1'
    },
  ], {
    nid: 'id',
    eid: 'id',
    sourceKey: 'source',
    targetKey: 'target',
    dir: (edge) => edge.source + '-' + edge.target,
  })

  neo4j.nodes.size
    
  neo4j.sources.forType


  const output = () => { 
    const result = {
      nodes: neo4j.nodes.map((node) => node.id),
      edges: neo4j.edges.map((edge) => edge.id),
      sources: <string[]>[],
      targets: <string[]>[],
      dirs: neo4j.dirs.map((edge) => edge.id),
    }
    neo4j.sources.forType((edges) => { 
      edges.forEach((edge) => { 
        result.sources.push(edge.id)
      })
    })
    neo4j.targets.forType((edges) => { 
      edges.forEach((edge) => { 
        result.targets.push(edge.id)
      })
    })
    return result
  }

  it('Init', function () { 
    deepStrictEqual<ReturnType<typeof output>>(output(), {
      nodes: ['n1', 'n2'],
      edges: ['e1', 'e2', 'e3', 'e4'],
      sources: ['e1', 'e3', 'e2', 'e4'],
      targets: ['e1', 'e2', 'e3', 'e4'],
      dirs: ['e1', 'e2', 'e4'],
    })
  })

  it('add()', function () { 
    neo4j.node('add', {
      id: 'n3',
      name: 'node-3'
    })
    neo4j.edge('add', {
      id: 'e5',
      name: 'edge-5',
      source: 'n3',
      target: 'n2'
    })
    deepStrictEqual<ReturnType<typeof output>>(output(), {
      nodes: ['n1', 'n2', 'n3'],
      edges: ['e1', 'e2', 'e3', 'e4', 'e5'],
      sources: ['e1', 'e3', 'e2', 'e4', 'e5'],
      targets: ['e1', 'e5', 'e2', 'e3', 'e4'],
      dirs: ['e1', 'e2', 'e4', 'e5'],
    })
  })

  it('edge delete()', function () { 
    neo4j.edge('delete', 'e2')
    deepStrictEqual<ReturnType<typeof output>>(output(), {
      nodes: ['n1', 'n2', 'n3'],
      edges: ['e1', 'e3', 'e4', 'e5'],
      sources: ['e1', 'e3', 'e4', 'e5'],
      targets: ['e1', 'e5', 'e3', 'e4'],
      dirs: ['e1', 'e4', 'e5'],
    })
  })

  it('node delete()', function () { 
    neo4j.node('delete', 'n1')
    deepStrictEqual<ReturnType<typeof output>>(output(), {
      nodes: ['n2', 'n3'],
      edges: ['e5'],
      sources: ['e5'],
      targets: ['e5'],
      dirs: ['e5'],
    })
  })

  it('clear()', function () { 
    neo4j.clear()
    deepStrictEqual<ReturnType<typeof output>>(output(), {
      nodes: [],
      edges: [],
      sources: [],
      targets: [],
      dirs: [],
    })
  })
})