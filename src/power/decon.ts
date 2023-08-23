const ERROR_MESSAGE = {
  INT: '参数必须是整数',
  MIN: '多个2的正整数幂(两两不相等)之和必定大于等于1',
}

type Sort = 'asc' | 'desc'

/**
 * 解构多个2的正整数幂(两两不相等)之和
 * @param sum 幂和
 * @param sort 排序方式(默认降序)
 * @description sum > 2**53则会因为精度问题计算报错
 */
const deconPowersSum = (sum: number, sort?: Sort) => { 
  if (sum < 1) {
    throw new Error(ERROR_MESSAGE.MIN)
  } else if (sum !== Math.floor(sum)) { 
    throw new Error(ERROR_MESSAGE.INT)
  }
  const list: number[] = []
  let cache = sum
  while (cache) { 
    const power = Math.log2(cache) ^ 0
    list.push(power)
    cache -= Math.pow(2, power)
  }
  return sort === 'asc'
    ? list.reverse()
    : list
}

export default deconPowersSum