# @vope/utils

工具函数库

## 安装

```bash
npm install @vope/utils
# 或
pnpm add @vope/utils
# 或
yarn add @vope/utils
```

## Logs
[CHANGELOG](./CHANGELOG.md)

## API 文档

### 异步控制

| 函数名 | 说明 |
|--------|------|
| asyncLock | 异步锁 |
| once | 缓存函数返回值 |
| wait | 等待 |
| Subscriber | 订阅 |

### 树结构处理

| 函数名 | 说明 |
|--------|------|
| FlatTree | 扁平树 |
| forBfsEach | 广度优先搜索 |
| forDfsEach | 深度优先搜索 |

### 数据转换

| 函数名 | 说明 |
|--------|------|
| parseNum | 解析一个字符串并返回一个数字 |
| hash8json | 对象数组转 hash |
| hash8object | 对象转 hash |
| hash8strings | 字符串数组转 hash |

### 数学计算

| 函数名 | 说明 |
|--------|------|
| calc | CSS 长度值加减混合运算 |
| calc.getExpMN | 获取表达式方法名 |
| calc.multiply | CSS 长度值乘法运算 |
| calc.divide | CSS 长度值除法运算 |
| calc.formatter | CSS 长度值格式化 |
| calc.clamp | CSS 长度值取中间值运算 |
| clamp | 获取中间数 |

### 类型判断

| 函数名 | 说明 |
|--------|------|
| isNull | 检测是否无值 (undefined/null) |
| isEmpty | 检测是否为空 (undefined/null/'') |
| isClass | 判断是否为 Class |
| isKey | 判断是否为有效的对象键 |

### 样式处理

| 函数名 | 说明 |
|--------|------|
| classnames | 拼接多个 class |
| css | CSS 样式处理 |

### 数据脱敏

| 函数名 | 说明 |
|--------|------|
| desensEncrypt | 脱敏加密 (对明文进行多个片段加密) |
| desensDecrypt | 脱敏解密 (对密文进行多个片段解密) |
| desensReplace | 脱敏平替 |

### Cron 表达式

| 函数名 | 说明 |
|--------|------|
| weekDic | 星期字典 |
| default_max_second | 默认最大秒 |
| default_min_second | 默认最小秒 |
| default_max_minute | 默认最大分 |
| default_min_minute | 默认最小分 |
| default_max_hour | 默认最大时 |
| default_min_hour | 默认最小时 |
| default_max_day | 默认最大日 |
| default_min_day | 默认最小日 |
| default_max_month | 默认最大月 |
| default_min_month | 默认最小月 |
| default_max_week | 默认最大周 |
| default_min_week | 默认最小周 |
| createCronRegexText | 创建 Cron 正则表达式文本 |
| InvalidUnit | 无效单位 |
| isInvalidUnit | 是否为无效单位 |
| DayLastUnit | 月末单位 |
| isDayLastUnit | 是否为月末单位 |
| WeekLastUnit | 周最后单位 |
| isWeekLastUnit | 是否为周最后单位 |
| WildcardUnit | 通配符单位 |
| isWildcardUnit | 是否为通配符单位 |
| RangeUnit | 范围单位 |
| isRangeUnit | 是否为范围单位 |
| AggUnit | 聚合单位 |
| isAggUnit | 是否为聚合单位 |
| Cron | Cron 表达式 |

### 比较操作

| 函数名 | 说明 |
|--------|------|
| compareVersion | 版本号大小比较 |
| deepWeakEqual | 深度弱相等比较 |

### 数据结构与集合

| 函数名 | 说明 |
|--------|------|
| DicRollup | 字典操作 |
| MemoryBasic | 内存基础 |
| MemoryList | 内存列表 |
| MemoryPower | 内存幂 |
| MemorySimple | 内存简单 |
| FlexTable | 弹性表格 |
| Union | 联合 |

### 图数据库

| 函数名 | 说明 |
|--------|------|
| Neo4j | 图管理 |
| Neo4jAhchors | 图布局之二阶贝塞尔曲线边锚点管理 |

### URL 与路径

| 函数名 | 说明 |
|--------|------|
| joinPaths | 拼接路径 |
| connectURLParams | 连接 URL 参数 |
| cubeURLParams | 将 URL 查询参数转换成 (复杂) 对象 |
| flatURLParams | 将 (复杂) 对象转换成 URL 查询参数 |
| Serializes | 序列化 |

### 几何变换

| 函数名 | 说明 |
|--------|------|
| rotateAngle | 角度旋转 |
| rotateRad | 弧度旋转 |

### 其他工具

| 函数名 | 说明 |
|--------|------|
| disableEnumerable | 禁用可枚举性 |
| indexSort | 索引排序 |
| getEncoding | 获取编码 |
| inputRegex | 输入正则 |
| loadImage | 加载图片 |
| deconPowersSum | 幂和分解 |

## 测试

```bash
npm run test
```

## 构建

```bash
npm run build
```

## License

ISC
