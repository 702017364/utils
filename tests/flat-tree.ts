import { FlatTree } from '@vope/utils'
import { strictEqual, deepStrictEqual, ok } from 'assert'

interface TreeNode {
  id: string
  label: string
  pid?: string | null
}

describe('FlatTree', function () {
  describe('构造函数', function () {
    it('创建空树', function () {
      const tree = new FlatTree<'id', TreeNode, 'pid'>({
        key: 'id',
        origin: [],
        sup: 'pid'
      })
      
      ok(tree)
    })

    it('使用数组数据源创建树', function () {
      const data: TreeNode[] = [
        { id: '1', label: 'Root' },
        { id: '2', label: 'Child1', pid: '1' },
        { id: '3', label: 'Child2', pid: '1' }
      ]
      
      const tree = new FlatTree({
        key: 'id',
        origin: data,
        sup: 'pid'
      })
      
      strictEqual(tree.has('1'), true)
      strictEqual(tree.has('2'), true)
      strictEqual(tree.has('3'), true)
    })

    it('使用函数作为 sup 创建树', function () {
      const data: TreeNode[] = [
        { id: '1', label: 'Root' },
        { id: '2', label: 'Child1', pid: '1' }
      ]
      
      const tree = new FlatTree<'id', TreeNode>({
        key: 'id',
        origin: data,
        sup: (node) => node.pid
      })
      
      strictEqual(tree.has('1'), true)
      strictEqual(tree.has('2'), true)
    })
  })

  describe('add 方法', function () {
    it('添加顶级节点', function () {
      const tree = new FlatTree<'id', TreeNode, 'pid'>({
        key: 'id',
        origin: [],
        sup: 'pid'
      })
      
      const result = tree.add({ id: '1', label: 'Root' })
      
      strictEqual(result, true)
      strictEqual(tree.has('1'), true)
    })

    it('添加子节点', function () {
      const tree = new FlatTree<'id', TreeNode, 'pid'>({
        key: 'id',
        origin: [{ id: '1', label: 'Root' }],
        sup: 'pid'
      })
      
      const result = tree.add({ id: '2', label: 'Child', pid: '1' })
      
      strictEqual(result, true)
      strictEqual(tree.has('2'), true)
    })

    it('重复添加返回 false', function () {
      const tree = new FlatTree<'id', TreeNode, 'pid'>({
        key: 'id',
        origin: [],
        sup: 'pid'
      })
      
      tree.add({ id: '1', label: 'Root' })
      const result = tree.add({ id: '1', label: 'Root Duplicate' })
      
      strictEqual(result, false)
    })
  })

  describe('get 方法', function () {
    it('获取存在的节点', function () {
      const data: TreeNode[] = [
        { id: '1', label: 'Root' },
        { id: '2', label: 'Child', pid: '1' }
      ]
      
      const tree = new FlatTree({
        key: 'id',
        origin: data,
        sup: 'pid'
      })
      
      const node = tree.get('1')
      
      strictEqual(node?.id, '1')
      strictEqual(node?.label, 'Root')
    })

    it('获取不存在的节点返回 undefined', function () {
      const tree = new FlatTree<'id', TreeNode, 'pid'>({
        key: 'id',
        origin: [],
        sup: 'pid'
      })
      
      const node = tree.get('non-existent')
      
      strictEqual(node, undefined)
    })
  })

  describe('getSup 方法', function () {
    it('获取父节点', function () {
      const data: TreeNode[] = [
        { id: '1', label: 'Root' },
        { id: '2', label: 'Child', pid: '1' }
      ]
      
      const tree = new FlatTree({
        key: 'id',
        origin: data,
        sup: 'pid'
      })
      
      const parent = tree.getSup('2')
      
      strictEqual(parent?.id, '1')
    })

    it('获取顶级节点的父节点返回 undefined', function () {
      const tree = new FlatTree<'id', TreeNode, 'pid'>({
        key: 'id',
        origin: [{ id: '1', label: 'Root' }],
        sup: 'pid'
      })
      
      const parent = tree.getSup('1')
      
      strictEqual(parent, undefined)
    })
  })

  describe('has 方法', function () {
    it('检查存在的节点', function () {
      const tree = new FlatTree({
        key: 'id',
        origin: [{ id: '1', label: 'Root' }],
        sup: 'pid'
      })
      
      strictEqual(tree.has('1'), true)
    })

    it('检查不存在的节点', function () {
      const tree = new FlatTree({
        key: 'id',
        origin: [],
        sup: 'pid'
      })
      
      strictEqual(tree.has('non-existent'), false)
    })
  })

  describe('delete 方法', function () {
    it('删除单个节点', function () {
      const tree = new FlatTree({
        key: 'id',
        origin: [
          { id: '1', label: 'Root' },
          { id: '2', label: 'Child', pid: '1' }
        ],
        sup: 'pid'
      })
      
      const result = tree.delete('2')
      
      strictEqual(result, true)
      strictEqual(tree.has('2'), false)
      strictEqual(tree.has('1'), true)
    })

    it('删除节点时级联删除子孙节点', function () {
      const data: TreeNode[] = [
        { id: '1', label: 'Root' },
        { id: '2', label: 'Child1', pid: '1' },
        { id: '3', label: 'GrandChild', pid: '2' }
      ]
      
      const tree = new FlatTree({
        key: 'id',
        origin: data,
        sup: 'pid'
      })
      
      const result = tree.delete('1')
      
      strictEqual(result, true)
      strictEqual(tree.has('1'), false)
      strictEqual(tree.has('2'), false)
      strictEqual(tree.has('3'), false)
    })

    it('删除不存在的节点返回 false', function () {
      const tree = new FlatTree({
        key: 'id',
        origin: [],
        sup: 'pid'
      })
      
      const result = tree.delete('non-existent')
      
      strictEqual(result, false)
    })
  })

  describe('deleteSubs 方法', function () {
    it('删除所有子节点', function () {
      const data: TreeNode[] = [
        { id: '1', label: 'Root' },
        { id: '2', label: 'Child1', pid: '1' },
        { id: '3', label: 'Child2', pid: '1' },
        { id: '4', label: 'GrandChild', pid: '2' }
      ]
      
      const tree = new FlatTree({
        key: 'id',
        origin: data,
        sup: 'pid'
      })
      
      const result = tree.deleteSubs('1')
      
      strictEqual(result, true)
      strictEqual(tree.has('1'), true)
      strictEqual(tree.has('2'), false)
      strictEqual(tree.has('3'), false)
      strictEqual(tree.has('4'), false)
    })

    it('删除没有子节点的节点返回 true', function () {
      const tree = new FlatTree({
        key: 'id',
        origin: [{ id: '1', label: 'Leaf' }],
        sup: 'pid'
      })
      
      const result = tree.deleteSubs('1')
      
      strictEqual(result, true)
    })

    it('删除不存在的节点的子节点返回 false', function () {
      const tree = new FlatTree({
        key: 'id',
        origin: [],
        sup: 'pid'
      })
      
      const result = tree.deleteSubs('non-existent')
      
      strictEqual(result, false)
    })
  })

  describe('updateSup 方法', function () {
    it('更新节点的父节点', function () {
      const data: TreeNode[] = [
        { id: '1', label: 'Root1' },
        { id: '2', label: 'Root2' },
        { id: '3', label: 'Child', pid: '1' }
      ]
      
      const tree = new FlatTree({
        key: 'id',
        origin: data,
        sup: 'pid'
      })
      
      const result = tree.updateSup({ id: '3', label: 'Child', pid: '2' })
      
      strictEqual(result, true)
      const parent = tree.getSup('3')
      strictEqual(parent?.id, '2')
    })

    it('将子节点变为顶级节点', function () {
      const data: TreeNode[] = [
        { id: '1', label: 'Root' },
        { id: '2', label: 'Child', pid: '1' }
      ]
      
      const tree = new FlatTree({
        key: 'id',
        origin: data,
        sup: 'pid'
      })
      
      const result = tree.updateSup({ id: '2', label: 'Child', pid: null })
      
      strictEqual(result, true)
      const parent = tree.getSup('2')
      strictEqual(parent, undefined)
    })

    it('将顶级节点变为子节点', function () {
      const data: TreeNode[] = [
        { id: '1', label: 'Root1' },
        { id: '2', label: 'Root2' },
        { id: '3', label: 'Child', pid: '1' }
      ]
      
      const tree = new FlatTree({
        key: 'id',
        origin: data,
        sup: 'pid'
      })
      
      // 将顶级节点 '2' 变为节点 '1' 的子节点
      const result = tree.updateSup({ id: '2', label: 'Root2', pid: '1' })
      
      strictEqual(result, true)
      const parent = tree.getSup('2')
      strictEqual(parent?.id, '1')
    })

    it('更新不存在的节点返回 false', function () {
      const tree = new FlatTree<'id', TreeNode, 'pid'>({
        key: 'id',
        origin: [],
        sup: 'pid'
      })
      
      const result = tree.updateSup({ id: 'non-existent', label: 'Test' })
      
      strictEqual(result, false)
    })
  })

  describe('forEach 方法', function () {
    it('默认模式遍历所有节点', function () {
      const data: TreeNode[] = [
        { id: '1', label: 'Root' },
        { id: '2', label: 'Child1', pid: '1' },
        { id: '3', label: 'Child2', pid: '1' }
      ]
      
      const tree = new FlatTree({
        key: 'id',
        origin: data,
        sup: 'pid'
      })
      
      const result: string[] = []
      tree.forEach((node) => {
        result.push(node.id)
      })
      
      strictEqual(result.length, 3)
      ok(result.includes('1'))
      ok(result.includes('2'))
      ok(result.includes('3'))
    })

    it('广度优先遍历 (mode=1)', function () {
      const data: TreeNode[] = [
        { id: '1', label: 'Root' },
        { id: '2', label: 'Child1', pid: '1' },
        { id: '3', label: 'Child2', pid: '1' },
        { id: '4', label: 'GrandChild1', pid: '2' },
        { id: '5', label: 'GrandChild2', pid: '2' },
        { id: '6', label: 'GrandChild3', pid: '3' }
      ]
      
      const tree = new FlatTree({
        key: 'id',
        origin: data,
        sup: 'pid'
      })
      
      const result: string[] = []
      tree.forEach((node) => {
        result.push(node.id)
      }, 1)
      
      // BFS 顺序：1, 2, 3, 4, 5, 6
      deepStrictEqual(result, ['1', '2', '3', '4', '5', '6'])
    })

    it('深度优先遍历 (mode=2)', function () {
      const data: TreeNode[] = [
        { id: '1', label: 'Root' },
        { id: '2', label: 'Child1', pid: '1' },
        { id: '3', label: 'Child2', pid: '1' },
        { id: '4', label: 'GrandChild1', pid: '2' },
        { id: '5', label: 'GrandChild2', pid: '2' },
        { id: '6', label: 'GrandChild3', pid: '3' }
      ]
      
      const tree = new FlatTree({
        key: 'id',
        origin: data,
        sup: 'pid'
      })
      
      const result: string[] = []
      tree.forEach((node) => {
        result.push(node.id)
      }, 2)
      
      // DFS 从左到右顺序：1, 2, 4, 5, 3, 6
      deepStrictEqual(result, ['1', '2', '4', '5', '3', '6'])
    })
  })

  describe('some 方法', function () {
    it('默认模式查询节点', function () {
      const data: TreeNode[] = [
        { id: '1', label: 'Root' },
        { id: '2', label: 'Child1', pid: '1' },
        { id: '3', label: 'Child2', pid: '1' }
      ]
      
      const tree = new FlatTree({
        key: 'id',
        origin: data,
        sup: 'pid'
      })
      
      const result = tree.some((node) => node.id === '2')
      
      strictEqual(result, true)
    })

    it('广度优先查询', function () {
      const data: TreeNode[] = [
        { id: '1', label: 'Root' },
        { id: '2', label: 'Child1', pid: '1' },
        { id: '3', label: 'Child2', pid: '1' }
      ]
      
      const tree = new FlatTree({
        key: 'id',
        origin: data,
        sup: 'pid'
      })
      
      const result = tree.some((node) => node.id === '3', 1)
      
      strictEqual(result, true)
    })

    it('深度优先查询', function () {
      const data: TreeNode[] = [
        { id: '1', label: 'Root' },
        { id: '2', label: 'Child1', pid: '1' },
        { id: '3', label: 'Child2', pid: '1' }
      ]
      
      const tree = new FlatTree({
        key: 'id',
        origin: data,
        sup: 'pid'
      })
      
      const result = tree.some((node) => node.id === '3', 2)
      
      strictEqual(result, true)
    })

    it('未找到匹配节点返回 false', function () {
      const tree = new FlatTree<'id', TreeNode, 'pid'>({
        key: 'id',
        origin: [{ id: '1', label: 'Root' }],
        sup: 'pid'
      })
      
      debugger
      const result = tree.some((node) => node.id === 'non-existent')
      
      strictEqual(result, false)
    })
  })

  describe('clear 方法', function () {
    it('清空所有节点', function () {
      const data: TreeNode[] = [
        { id: '1', label: 'Root' },
        { id: '2', label: 'Child', pid: '1' }
      ]
      
      const tree = new FlatTree({
        key: 'id',
        origin: data,
        sup: 'pid'
      })
      
      tree.clear()
      
      strictEqual(tree.has('1'), false)
      strictEqual(tree.has('2'), false)
    })

    it('清空后可以重新添加节点', function () {
      const tree = new FlatTree({
        key: 'id',
        origin: [{ id: '1', label: 'Root' }],
        sup: 'pid'
      })
      
      tree.clear()
      const result = tree.add({ id: '2', label: 'New Root' })
      
      strictEqual(result, true)
      strictEqual(tree.has('2'), true)
      strictEqual(tree.has('1'), false)
    })
  })
})
