# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.0] - 2025-11-26

### Added
- 添加 asyncLock 功能 ([`src/async-lock.ts`](src/async-lock.ts))
- 添加 calc.getExpMN 计算函数 ([`src/calc/index.ts#L15-L25`](src/calc/index.ts#L15-L25))
- 添加 calc.multiply 计算函数 ([`src/calc/index.ts#L30-L40`](src/calc/index.ts#L30-L40))
- 添加 calc.divide 计算函数 ([`src/calc/index.ts#L45-L55`](src/calc/index.ts#L45-L55))
- 添加 disableEnumerable 功能 ([`src/disable-enumerable.ts`](src/disable-enumerable.ts))
- 添加 indexSort 功能 ([`src/index-sort.ts`](src/index-sort.ts))
- 添加版本变更日志 ([`CHANGELOG.md`](CHANGELOG.md))

### Fixed
- 修复 Subscriber 实例方法 $off 调用且之前未 $once 时报错的问题 ([`src/subscriber.ts#L80-L90`](src/subscriber.ts#L80-L90))

### Changed
- 优化 calc.formatter 函数 ([`src/calc/index.ts#L5-L10`](src/calc/index.ts#L5-L10))
- 优化 calc.clamp 函数 ([`src/clamp.ts#L5-L15`](src/clamp.ts#L5-L15))
- MemoryBasic 添加 emit 配置项，原 list 和 memorys 属性改成 [LIST_SYMBOL] 和 [MEMORYS_SYMBOL] ([`src/memory/basic.ts#L20-L35`](src/memory/basic.ts#L20-L35))
- namespace Memory 移到 memory/basic.ts 内 ([`src/memory/basic.ts#L1-L10`](src/memory/basic.ts#L1-L10))
- 使用 AI 优化测试用例 ([`tests/*`](tests))
- 更新 csstype 依赖到 3.2.3