# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.6] - 2026-04-08

### Added
- 添加 [forDfsStackEach](src/each.ts) 方法，支撑在树结构中类似于统计子节点的数据量场景

### Changed
- [OfflineStorage](src/storage//offline.ts) 添加 @ts-ignore 忽略 ts 错误信息
- 将 shims.env.d.ts 重命名为 shime.env.d.ts


## [1.7.5] - 2026-04-03

### Added
- [`FlatTree.getSub`](src/flat-tree.ts) 方法支持设置参数value=null时获取所有顶级节点


## [1.7.4] - 2026-04-01

### Added
- 添加 [`FlatTree.getSub`](src/flat-tree.ts) 方法，支持获取子节点及回调处理


## [1.7.3] - 2026-03-25

### Changed
- 修改 README.md


## [1.7.2] - 2026-03-24

### Added
- 添加 [forBfsEach](src/each.ts) 和 [forDfsEach](src/each.ts) 函数及其测试
- 添加 [FlatTree](src/flat-tree.ts) 类及其测试，支持树结构的扁平化存储和遍历（包括 BFS 和 DFS 模式）
- 添加 [Union](src/union.ts) 命名空间导出，现在可通过 Union.Status 推导出 Union 实例的联合状态


## [1.7.1] - 2026-01-06

### Added
- [MemorySimple](src/memory/simple.ts) 添加 emit 配置参数


## [1.7.0] - 2025-11-26

### Added
- 添加 [asyncLock](src/async-lock.ts) 功能
- 添加 [calc.getExpMN](src/calc.ts) 计算函数
- 添加 [calc.multiply](src/calc.ts) 计算函数
- 添加 [calc.divide](src/calc.ts) 计算函数
- 添加 [disableEnumerable](src/disable-enumerable.ts) 功能
- 添加 [indexSort](src/index-sort.ts) 功能
- 添加 版本变更日志

### Fixed
- 修复 [Subscriber.$off](src/subscriber.ts) 实例方法调用且之前未 $once 时报错的问题

### Changed
- 优化 [calc.formatter](src/calc.ts) 函数
- 优化 [calc.clamp](src/calc.ts) 函数
- [MemoryBasic](src/memory/basic.ts) 添加 emit 配置项，原 list 和 memorys 属性改成 [LIST_SYMBOL] 和 [MEMORYS_SYMBOL]
- namespace [Memory](src/memory/basic.ts) 移到 memory/basic.ts 内
- 使用 AI 优化测试用例
- 更新 csstype 依赖到 3.2.3