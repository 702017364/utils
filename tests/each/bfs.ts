import { forBfsAsyncEach, forBfsEach, wait } from '@vope/utils'
import { deepStrictEqual } from 'assert'

interface Item { 
  id: string
  label: string
  children?: Item[]
}

describe('forBfsEach()', function () {
  it('广度优先遍历数组', function () {
    const result: Item[] = []
    const list: Item[] = [
      { id: '1', label: 'A' },
      { id: '2', label: 'B' },
      { id: '3', label: 'C' }
    ]
    
    forBfsEach(
      list,
      (value) => [],
      (value) => {
        result.push(value)
        return true
      }
    )
    
    deepStrictEqual(result.map(i => i.id), ['1', '2', '3'])
  })

  it('广度优先遍历 Set', function () {
    const result: Item[] = []
    const list = new Set<Item>([
      { id: 'a', label: 'Node A' },
      { id: 'b', label: 'Node B' },
      { id: 'c', label: 'Node C' }
    ])
    
    forBfsEach(
      list,
      (value) => [],
      (value) => {
        result.push(value)
        return true
      }
    )
    
    // Set 的遍历顺序是插入顺序
    deepStrictEqual(result.map(i => i.id), ['a', 'b', 'c'])
  })

  it('带多层子孙节点的 Set 广度优先遍历', function () {
    const result: Item[] = []
    const rootNode1: Item = {
      id: 'root1',
      label: 'Root 1',
      children: [
        {
          id: 'child1-1',
          label: 'Child 1-1',
          children: [
            { id: 'grandchild1-1-1', label: 'GrandChild 1-1-1' }
          ]
        },
        { id: 'child1-2', label: 'Child 1-2' }
      ]
    }
    
    const rootNode2: Item = {
      id: 'root2',
      label: 'Root 2',
      children: [
        {
          id: 'child2-1',
          label: 'Child 2-1',
          children: [
            { id: 'grandchild2-1-1', label: 'GrandChild 2-1-1' },
            { id: 'grandchild2-1-2', label: 'GrandChild 2-1-2' }
          ]
        }
      ]
    }
    
    const list = new Set<Item>([rootNode1, rootNode2])
    
    forBfsEach(
      list,
      (value) => value.children,
      (value) => {
        result.push(value)
        return true
      }
    )
    
    // BFS 顺序：root1, root2, child1-1, child1-2, child2-1, grandchild1-1-1, grandchild2-1-1, grandchild2-1-2
    deepStrictEqual(result.map(i => i.id), [
      'root1',
      'root2',
      'child1-1',
      'child1-2',
      'child2-1',
      'grandchild1-1-1',
      'grandchild2-1-1',
      'grandchild2-1-2'
    ])
  })

  it('带子节点的广度优先遍历', function () {
    const result: Item[] = []
    const tree: Item = {
      id: '1',
      label: 'Root',
      children: [
        {
          id: '2',
          label: 'Child1',
          children: [
            { id: '4', label: 'GrandChild1' },
            { id: '5', label: 'GrandChild2' }
          ]
        },
        {
          id: '3',
          label: 'Child2',
          children: [
            { id: '6', label: 'GrandChild3' }
          ]
        }
      ]
    }
    
    forBfsEach(
      [tree],
      (value) => value.children,
      (value) => {
        result.push(value)
        return true
      }
    )
    
    // 广度优先应该是：1, 2, 3, 4, 5, 6
    deepStrictEqual(result.map(i => i.id), ['1', '2', '3', '4', '5', '6'])
  })

  it('回调返回 false 时停止遍历', function () {
    const result: Item[] = []
    const list: Item[] = [
      { id: '1', label: 'A' },
      { id: '2', label: 'B' },
      { id: '3', label: 'C' },
      { id: '4', label: 'D' },
      { id: '5', label: 'E' }
    ]
    
    forBfsEach(
      list,
      (value) => [],
      (value) => {
        result.push(value)
        return value.id !== '3'
      }
    )
    
    deepStrictEqual(result.map(i => i.id), ['1', '2', '3'])
  })

  it('带子节点且提前停止的遍历', function () {
    const result: Item[] = []
    const tree: Item = {
      id: '1',
      label: 'Root',
      children: [
        {
          id: '2',
          label: 'Child1',
          children: [
            { id: '4', label: 'GrandChild1' },
            { id: '5', label: 'GrandChild2' }
          ]
        },
        {
          id: '3',
          label: 'Child2',
          children: [
            { id: '6', label: 'GrandChild3' }
          ]
        }
      ]
    }
    
    forBfsEach(
      [tree],
      (value) => value.children,
      (value) => {
        result.push(value)
        return value.id !== '2'
      }
    )
    
    // 当遇到 2 时停止，所以只有 1, 2
    deepStrictEqual(result.map(i => i.id), ['1', '2'])
  })

  it('在较深层返回 false 时彻底停止遍历', function () {
    const result: Item[] = []
    const tree: Item = {
      id: '1',
      label: 'Root',
      children: [
        { id: '2', label: 'Child 1', children: [{ id: '4', label: 'Grandchild' }] },
        { id: '3', label: 'Child 2' }
      ]
    }

    forBfsEach(
      [tree],
      value => value.children,
      value => {
        result.push(value)
        return value.id !== '3'
      }
    )

    deepStrictEqual(result.map(i => i.id), ['1', '2', '3'])
  })

  it('空列表遍历', function () {
    const result: Item[] = []
    
    forBfsEach(
      [],
      (value) => [],
      (value) => {
        result.push(value)
        return true
      }
    )
    
    deepStrictEqual(result, [])
  })

  it('up 返回 void 的情况', function () {
    const result: Item[] = []
    const list: Item[] = [
      { id: '1', label: 'A' },
      { id: '2', label: 'B' },
      { id: '3', label: 'C' }
    ]
    
    forBfsEach(
      list,
      (value) => void 0,
      (value) => {
        result.push(value)
        return true
      }
    )
    
    deepStrictEqual(result.map(i => i.id), ['1', '2', '3'])
  })

  it('复杂树结构的广度优先遍历', function () {
    const result: Item[] = []
    const tree: Item = {
      id: '1',
      label: 'A',
      children: [
        {
          id: '2',
          label: 'B',
          children: [
            { id: '4', label: 'D', children: [{ id: '7', label: 'G' }] },
            { id: '5', label: 'E' }
          ]
        },
        {
          id: '3',
          label: 'C',
          children: [
            { id: '6', label: 'F' }
          ]
        }
      ]
    }
    
    forBfsEach(
      [tree],
      (value) => value.children,
      (value) => {
        result.push(value)
        return true
      }
    )
    
    // 广度优先：A, B, C, D, E, F, G
    deepStrictEqual(result.map(i => i.id), ['1', '2', '3', '4', '5', '6', '7'])
  })
})

interface AsyncItem { 
  id: string
  label: string
  wait: number
  children?: AsyncItem[]
}

describe('forBfsAsyncEach()', function () {
  it('按广度优先顺序等待每个异步回调', async function () {
    const result: AsyncItem[] = []
    const list: AsyncItem[] = [
      { id: '1', label: 'A', wait: 50 },
      { id: '2', label: 'B', wait: 15 },
      { id: '3', label: 'C', wait: 20 }
    ]
    
    await forBfsAsyncEach(
      list,
      () => [],
      async (data) => {
        await wait(data.wait)
        result.push(data)
        return true
      }
    )
    
    deepStrictEqual(result.map(i => i.id), ['1', '2', '3'])
  })

  it('广度优先异步遍历 Set 和多层子节点', async function () {
    const result: AsyncItem[] = []
    const first: AsyncItem = {
      id: '1',
      label: 'A',
      wait: 0,
      children: [
        { id: '3', label: 'C', wait: 0 },
        { id: '4', label: 'D', wait: 0, children: [{ id: '7', label: 'G', wait: 0 }] }
      ]
    }
    const second: AsyncItem = {
      id: '2',
      label: 'B',
      wait: 0,
      children: [
        { id: '5', label: 'E', wait: 0 },
        { id: '6', label: 'F', wait: 0 }
      ]
    }

    await forBfsAsyncEach(
      new Set([first, second]),
      value => value.children,
      async value => {
        await wait()
        result.push(value)
        return true
      }
    )

    deepStrictEqual(result.map(i => i.id), ['1', '2', '3', '4', '5', '6', '7'])
  })

  it('异步回调返回 false 时彻底停止遍历', async function () {
    const result: AsyncItem[] = []
    const tree: AsyncItem = {
      id: '1',
      label: 'Root',
      wait: 0,
      children: [
        { id: '2', label: 'Child 1', wait: 0, children: [{ id: '4', label: 'Grandchild', wait: 0 }] },
        { id: '3', label: 'Child 2', wait: 0 }
      ]
    }

    await forBfsAsyncEach(
      [tree],
      value => value.children,
      async value => {
        result.push(value)
        return value.id !== '3'
      }
    )

    deepStrictEqual(result.map(i => i.id), ['1', '2', '3'])
  })

  it('空数组和空 Set 不调用回调', async function () {
    let callbackCount = 0
    const callback = async () => {
      callbackCount++
      return true
    }

    await forBfsAsyncEach([], () => [], callback)
    await forBfsAsyncEach(new Set<AsyncItem>(), () => [], callback)

    deepStrictEqual(callbackCount, 0)
  })

  it('up 返回 void 时继续遍历当前列表', async function () {
    const result: AsyncItem[] = []
    const list: AsyncItem[] = [
      { id: '1', label: 'A', wait: 0 },
      { id: '2', label: 'B', wait: 0 },
      { id: '3', label: 'C', wait: 0 }
    ]

    await forBfsAsyncEach(
      list,
      () => void 0,
      async value => {
        result.push(value)
        return true
      }
    )

    deepStrictEqual(result.map(i => i.id), ['1', '2', '3'])
  })
})
