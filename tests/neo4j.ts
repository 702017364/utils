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
  it('初始化图管理器', function () { 
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
    ], {
      nid: 'id',
      eid: 'id',
      sourceKey: 'source',
      targetKey: 'target',
    })

    const actual = {
      nodes: neo4j.nodes.map((node) => node.id),
      edges: neo4j.edges.map((edge) => edge.id),
    }

    const expected = {
      nodes: ['n1', 'n2'],
      edges: ['e1', 'e2', 'e3'],
    }

    deepStrictEqual(actual, expected)
  })

  it('node() 添加节点', function () { 
    const neo4j = new Neo4j<INode, IEdge>([], [], {
      nid: 'id',
      eid: 'id',
      sourceKey: 'source',
      targetKey: 'target',
    })

    neo4j.node('add', {
      id: 'n1',
      name: 'node-1'
    })

    neo4j.node('add', {
      id: 'n2',
      name: 'node-2'
    })

    const actual = neo4j.nodes.map((node) => node.id)
    const expected = ['n1', 'n2']

    deepStrictEqual(actual, expected)
  })

  it('edge() 添加边', function () { 
    const neo4j = new Neo4j<INode, IEdge>([
      {
        id: 'n1',
        name: 'node-1'
      },
      {
        id: 'n2',
        name: 'node-2'
      },
    ], [], {
      nid: 'id',
      eid: 'id',
      sourceKey: 'source',
      targetKey: 'target',
    })

    neo4j.edge('add', {
      id: 'e1',
      name: 'edge-1',
      source: 'n1',
      target: 'n2'
    })

    const actual = neo4j.edges.map((edge) => edge.id)
    const expected = ['e1']

    deepStrictEqual(actual, expected)
  })

  it('sources 视图', function () { 
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
        source: 'n1',
        target: 'n1'
      },
    ], {
      nid: 'id',
      eid: 'id',
      sourceKey: 'source',
      targetKey: 'target',
    })

    const actual: string[] = []
    neo4j.sources.forType((edges) => {
      edges.forEach((edge) => {
        actual.push(edge.id)
      })
    })

    const expected = ['e1', 'e2']

    deepStrictEqual(actual, expected)
  })

  it('targets 视图', function () { 
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
        source: 'n1',
        target: 'n1'
      },
    ], {
      nid: 'id',
      eid: 'id',
      sourceKey: 'source',
      targetKey: 'target',
    })

    const actual: string[] = []
    neo4j.targets.forType((edges) => {
      edges.forEach((edge) => {
        actual.push(edge.id)
      })
    })

    const expected = ['e1', 'e2']

    deepStrictEqual(actual, expected)
  })

  it('dirs 视图', function () { 
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
        source: 'n1',
        target: 'n1'
      },
    ], {
      nid: 'id',
      eid: 'id',
      sourceKey: 'source',
      targetKey: 'target',
    })

    const actual = neo4j.dirs.map((edge) => edge.id)
    const expected = ['e1']

    deepStrictEqual(actual, expected)
  })

  it('edge() 删除边', function () { 
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
    ], {
      nid: 'id',
      eid: 'id',
      sourceKey: 'source',
      targetKey: 'target',
    })

    neo4j.edge('delete', 'e1')

    const actual = {
      edges: neo4j.edges.map((edge) => edge.id),
      sources: (() => {
        const result: string[] = []
        neo4j.sources.forType((edges) => {
          edges.forEach((edge) => {
            result.push(edge.id)
          })
        })
        return result
      })(),
      targets: (() => {
        const result: string[] = []
        neo4j.targets.forType((edges) => {
          edges.forEach((edge) => {
            result.push(edge.id)
          })
        })
        return result
      })(),
    }

    const expected = {
      edges: ['e2'],
      sources: ['e2'],
      targets: ['e2'],
    }

    deepStrictEqual(actual, expected)
  })

  it('node() 删除节点', function () { 
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
    ], {
      nid: 'id',
      eid: 'id',
      sourceKey: 'source',
      targetKey: 'target',
    })

    const deletedEdges = neo4j.node('delete', 'n1')

    const actual = {
      nodes: neo4j.nodes.map((node) => node.id),
      edges: neo4j.edges.map((edge) => edge.id),
      deletedEdges: deletedEdges.map((edge) => edge.id).sort(),
    }

    const expected = {
      nodes: ['n2'],
      edges: [],
      deletedEdges: ['e1', 'e2', 'e3'],
    }

    deepStrictEqual(actual, expected)
  })

  it('clear() 清理图管理数据', function () { 
    const neo4j = new Neo4j<INode, IEdge>([
      {
        id: 'n1',
        name: 'node-1'
      },
    ], [
      {
        id: 'e1',
        name: 'edge-1',
        source: 'n1',
        target: 'n1'
      },
    ], {
      nid: 'id',
      eid: 'id',
      sourceKey: 'source',
      targetKey: 'target',
    })

    neo4j.clear()

    const actual = {
      nodes: neo4j.nodes.size,
      edges: neo4j.edges.size,
      sources: (() => {
        let count = 0
        neo4j.sources.forType(() => count++)
        return count
      })(),
      targets: (() => {
        let count = 0
        neo4j.targets.forType(() => count++)
        return count
      })(),
      dirs: neo4j.dirs.size,
    }

    const expected = {
      nodes: 0,
      edges: 0,
      sources: 0,
      targets: 0,
      dirs: 0,
    }

    deepStrictEqual(actual, expected)
  })
})