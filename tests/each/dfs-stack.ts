import { forDfsStackAsyncEach, forDfsStackEach, wait } from '@vope/utils'
import { deepStrictEqual } from 'assert'

interface Item { 
  id: string
  label: string
  children?: Item[]
}

describe('forDfsStackEach()', function () {
  it('深度优先栈遍历数组', function () {
    const result: Item[] = []
    const list: Item[] = [
      { id: '1', label: 'A' },
      { id: '2', label: 'B' },
      { id: '3', label: 'C' }
    ]
    
    forDfsStackEach(
      list,
      (value) => [],
      (value) => {
        result.push(value)
        return true
      }
    )
    
    // 从里到外，但没有子节点，所以顺序不变
    deepStrictEqual(result.map(i => i.id), ['1', '2', '3'])
  })

  it('深度优先栈遍历 Set', function () {
    const result: Item[] = []
    const list = new Set<Item>([
      { id: 'x', label: 'Node X' },
      { id: 'y', label: 'Node Y' },
      { id: 'z', label: 'Node Z' }
    ])
    
    forDfsStackEach(
      list,
      (value) => [],
      (value) => {
        result.push(value)
        return true
      }
    )
    
    // Set 的遍历顺序是插入顺序，没有子节点时顺序不变
    deepStrictEqual(result.map(i => i.id), ['x', 'y', 'z'])
  })

  it('带多层子孙节点的 Set 深度优先栈遍历', function () {
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
    
    forDfsStackEach(
      list,
      (value) => value.children,
      (value) => {
        result.push(value)
        return true
      }
    )
    
    // 从里到外（后序遍历）：grandchild1-1-1, child1-1, child1-2, grandchild2-1-1, grandchild2-1-2, child2-1, root1, root2
    deepStrictEqual(result.map(i => i.id), [
      'grandchild1-1-1',
      'child1-1',
      'child1-2',
      'grandchild2-1-1',
      'grandchild2-1-2',
      'child2-1',
      'root1',
      'root2'
    ])
  })

  it('带子节点的深度优先栈遍历', function () {
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
    
    forDfsStackEach(
      [tree],
      (value) => value.children,
      (value) => {
        result.push(value)
        return true
      }
    )
    
    // 从里到外（后序遍历）：4, 5, 6, 2, 3, 1
    deepStrictEqual(result.map(i => i.id), ['4', '5', '6', '2', '3', '1'])
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
    
    forDfsStackEach(
      list,
      (value) => [],
      (value) => {
        result.push(value)
        return value.id !== '3'
      }
    )
    
    // 从里到外遍历，遇到 3 时停止
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
    
    forDfsStackEach(
      [tree],
      (value) => value.children,
      (value) => {
        result.push(value)
        return value.id !== '3'
      }
    )
    
    // 从里到外顺序：4, 5, 6, 2, 3（遇到 3 时停止，不再处理 1）
    deepStrictEqual(result.map(i => i.id), ['4', '5', '6', '2', '3'])
  })

  it('空列表遍历', function () {
    const result: Item[] = []
    
    forDfsStackEach(
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
    
    forDfsStackEach(
      list,
      (value) => void 0,
      (value) => {
        result.push(value)
        return true
      }
    )
    
    deepStrictEqual(result.map(i => i.id), ['1', '2', '3'])
  })

  it('复杂树结构的深度优先栈遍历', function () {
    const result: Item[] = []
    const tree: Item = {
      id: '1',
      label: 'A',
      children: [
        {
          id: '2',
          label: 'B',
          children: [
            { 
              id: '4', 
              label: 'D', 
              children: [
                { 
                  id: '7', 
                  label: 'G',
                  children: [
                    { id: '10', label: 'J' },
                    { id: '11', label: 'K' }
                  ]
                },
                { id: '8', label: 'H' }
              ]
            },
            { 
              id: '5', 
              label: 'E',
              children: [
                { id: '9', label: 'I' }
              ]
            }
          ]
        },
        {
          id: '3',
          label: 'C',
          children: [
            { 
              id: '6', 
              label: 'F',
              children: [
                { id: '12', label: 'L' },
                { id: '13', label: 'M' },
                { id: '14', label: 'N' }
              ]
            }
          ]
        },
        {
          id: '15',
          label: 'O',
          children: [
            { id: '16', label: 'P' },
            { 
              id: '17', 
              label: 'Q',
              children: [
                { id: '18', label: 'R' }
              ]
            }
          ]
        }
      ]
    }
    
    forDfsStackEach(
      [tree],
      (value) => value.children,
      (value) => {
        result.push(value)
        return true
      }
    )
    
    // 从里到外（后序遍历）：10, 11, 7, 8, 9, 4, 5, 12, 13, 14, 6, 18, 16, 17, 2, 3, 15, 1
    deepStrictEqual(result.map(i => i.id), ['10', '11', '7', '8', '9', '4', '5', '12', '13', '14', '6', '18', '16', '17', '2', '3', '15', '1'])
  })
})

interface AsyncItem { 
  id: string
  label: string
  wait: number
  children?: AsyncItem[]
}

describe('forDfsStackAsyncEach()', function () { 
  it('深度优先栈异步遍历数组', async function () {
    const result: AsyncItem[] = []
    const list: AsyncItem[] = [
      { id: '1', label: 'A', wait: 50 },
      { id: '2', label: 'B', wait: 15 },
      { id: '3', label: 'C', wait: 20 }
    ]
    
    await forDfsStackAsyncEach(
      list,
      (value) => [],
      async (data) => {
        await wait(data.wait)
        result.push(data)
        return true
      }
    )
    
    // 每个异步回调完成后才处理下一个节点
    deepStrictEqual(result.map(i => i.id), ['1', '2', '3'])
  })

  it('深度优先栈异步遍历 Set 和多层子节点', async function () {
    const result: AsyncItem[] = []
    const list = new Set<AsyncItem>([
      {
        id: '1',
        label: 'Root 1',
        wait: 0,
        children: [
          {
            id: '2',
            label: 'Child 1',
            wait: 0,
            children: [{ id: '3', label: 'Grandchild 1', wait: 0 }]
          },
          { id: '4', label: 'Child 2', wait: 0 }
        ]
      },
      { id: '5', label: 'Root 2', wait: 0 }
    ])

    await forDfsStackAsyncEach(
      list,
      (value) => value.children,
      async (value) => {
        await wait(value.wait)
        result.push(value)
        return true
      }
    )

    // 栈模式按后序遍历，并保持同级节点的原始顺序
    deepStrictEqual(result.map(i => i.id), ['3', '2', '4', '1', '5'])
  })

  it('异步回调返回 false 时停止遍历', async function () {
    const result: AsyncItem[] = []
    const list: AsyncItem[] = [
      { id: '1', label: 'A', wait: 0 },
      { id: '2', label: 'B', wait: 0 },
      { id: '3', label: 'C', wait: 0 },
      { id: '4', label: 'D', wait: 0 }
    ]

    await forDfsStackAsyncEach(
      list,
      (value) => [],
      async (value) => {
        await wait(value.wait)
        result.push(value)
        return value.id !== '3'
      }
    )

    deepStrictEqual(result.map(i => i.id), ['1', '2', '3'])
  })

  it('空列表不调用回调', async function () {
    const result: AsyncItem[] = []

    await forDfsStackAsyncEach(
      [],
      (value) => [],
      async (value) => {
        result.push(value)
        return true
      }
    )

    deepStrictEqual(result, [])
  })

  it('up 返回 void 时仍异步遍历所有节点', async function () {
    const result: AsyncItem[] = []
    const list: AsyncItem[] = [
      { id: '1', label: 'A', wait: 0 },
      { id: '2', label: 'B', wait: 0 }
    ]

    await forDfsStackAsyncEach(
      list,
      (value) => void 0,
      async (value) => {
        result.push(value)
        return true
      }
    )

    deepStrictEqual(result.map(i => i.id), ['1', '2'])
  })
})