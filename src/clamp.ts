/**
 * 获取中间数
 */
export const clamp = (value: number, min: number, max: number) => { 
  if (min > max) { 
    // js位运算的范围为(-2^32,2^32)，超出会产生溢出
    const swap = max
    max = min
    min = swap
  }
  return Math.min(max, Math.max(min, value))
}