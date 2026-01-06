# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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