import { forDfsAsyncEach, forDfsEach, wait } from '@vope/utils'
import { deepStrictEqual } from 'assert'

interface Item { 
  id: string
  label: string
  children?: Item[]
}

describe('forDfsEach()', function () {
  it('深度优先遍历数组', function () {
    const result: Item[] = []
    const list: Item[] = [
      { id: '1', label: 'A' },
      { id: '2', label: 'B' },
      { id: '3', label: 'C' }
    ]
    
    forDfsEach(
      list,
      (value) => [],
      (value) => {
        result.push(value)
        return true
      }
    )
    
    deepStrictEqual(result.map(i => i.id), ['1', '2', '3'])
  })

  it('深度优先遍历 Set', function () {
    const result: Item[] = []
    const list = new Set<Item>([
      { id: 'x', label: 'Node X' },
      { id: 'y', label: 'Node Y' },
      { id: 'z', label: 'Node Z' }
    ])
    
    forDfsEach(
      list,
      (value) => [],
      (value) => {
        result.push(value)
        return true
      }
    )
    
    // Set 的遍历顺序是插入顺序，DFS 从左到右
    deepStrictEqual(result.map(i => i.id), ['x', 'y', 'z'])
  })

  it('带多层子孙节点的 Set 深度优先遍历', function () {
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
    
    forDfsEach(
      list,
      (value) => value.children,
      (value) => {
        result.push(value)
        return true
      }
    )
    
    // DFS 从左到右顺序：root1, child1-1, grandchild1-1-1, child1-2, root2, child2-1, grandchild2-1-1, grandchild2-1-2
    deepStrictEqual(result.map(i => i.id), [
      'root1',
      'child1-1',
      'grandchild1-1-1',
      'child1-2',
      'root2',
      'child2-1',
      'grandchild2-1-1',
      'grandchild2-1-2'
    ])
  })

  it('带子节点的深度优先遍历', function () {
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
    
    forDfsEach(
      [tree],
      (value) => value.children,
      (value) => {
        result.push(value)
        return true
      }
    )
    
    // 深度优先从左到右：1, 2, 4, 5, 3, 6
    deepStrictEqual(result.map(i => i.id), ['1', '2', '4', '5', '3', '6'])
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
    
    forDfsEach(
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
    
    forDfsEach(
      [tree],
      (value) => value.children,
      (value) => {
        result.push(value)
        return value.id !== '3'
      }
    )
    
    // 当遇到 3 时停止，DFS 从左到右顺序：1, 2, 4, 5, 3
    deepStrictEqual(result.map(i => i.id), ['1', '2', '4', '5', '3'])
  })

  it('空列表遍历', function () {
    const result: Item[] = []
    
    forDfsEach(
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
    
    forDfsEach(
      list,
      (value) => void 0,
      (value) => {
        result.push(value)
        return true
      }
    )
    
    deepStrictEqual(result.map(i => i.id), ['1', '2', '3'])
  })

  it('复杂树结构的深度优先遍历', function () {
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
    
    forDfsEach(
      [tree],
      (value) => value.children,
      (value) => {
        result.push(value)
        return true
      }
    )
    
    // 深度优先从左到右：A, B, D, G, E, C, F
    deepStrictEqual(result.map(i => i.id), ['1', '2', '4', '7', '5', '3', '6'])
  })
})

interface AsyncItem { 
  id: string
  label: string
  wait: number
  children?: AsyncItem[]
}

describe('forDfsAsyncEach()', function () { 
  it('按深度优先顺序等待每个异步回调', async function () {
    const result: AsyncItem[] = []
    const list: AsyncItem[] = [
      { id: '1', label: 'A', wait: 50 },
      { id: '2', label: 'B', wait: 15 },
      { id: '3', label: 'C', wait: 20 }
    ]
    
    await forDfsAsyncEach(
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

  it('深度优先异步遍历 Set 和多层子节点', async function () {
    const result: AsyncItem[] = []
    const first: AsyncItem = {
      id: '1',
      label: 'Root 1',
      wait: 0,
      children: [
        {
          id: '2',
          label: 'Child 1',
          wait: 0,
          children: [{ id: '4', label: 'Grandchild 1', wait: 0 }]
        },
        { id: '5', label: 'Child 2', wait: 0 }
      ]
    }
    const second: AsyncItem = {
      id: '3',
      label: 'Root 2',
      wait: 0,
      children: [{ id: '6', label: 'Child 3', wait: 0 }]
    }

    await forDfsAsyncEach(
      new Set([first, second]),
      value => value.children,
      async value => {
        await wait()
        result.push(value)
        return true
      }
    )

    deepStrictEqual(result.map(i => i.id), ['1', '2', '4', '5', '3', '6'])
  })

  it('异步回调返回 false 时停止当前节点及其余节点', async function () {
    const result: AsyncItem[] = []
    const tree: AsyncItem = {
      id: '1',
      label: 'Root',
      wait: 0,
      children: [
        {
          id: '2',
          label: 'Child 1',
          wait: 0,
          children: [{ id: '4', label: 'Grandchild', wait: 0 }]
        },
        { id: '3', label: 'Child 2', wait: 0 }
      ]
    }

    await forDfsAsyncEach(
      [tree],
      value => value.children,
      async value => {
        await wait()
        result.push(value)
        return value.id !== '4'
      }
    )

    deepStrictEqual(result.map(i => i.id), ['1', '2', '4'])
  })

  it('空数组和空 Set 不调用回调', async function () {
    let callbackCount = 0
    const callback = async () => {
      callbackCount++
      return true
    }

    await forDfsAsyncEach([], () => [], callback)
    await forDfsAsyncEach(new Set<AsyncItem>(), () => [], callback)

    deepStrictEqual(callbackCount, 0)
  })

  it('up 返回 void 时继续遍历当前列表', async function () {
    const result: AsyncItem[] = []
    const list: AsyncItem[] = [
      { id: '1', label: 'A', wait: 0 },
      { id: '2', label: 'B', wait: 0 },
      { id: '3', label: 'C', wait: 0 }
    ]

    await forDfsAsyncEach(
      list,
      () => void 0,
      value => {
        result.push(value)
        return true
      }
    )

    deepStrictEqual(result.map(i => i.id), ['1', '2', '3'])
  })
})