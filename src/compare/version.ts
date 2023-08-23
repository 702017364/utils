const CHAR = '.'

/**
 * 版本号大小比较
 * @description from < to = 1，from === to = 0，from > to = -1
 */
const compareVersion = (from: string, to: string) => {
  const froms = from.split(CHAR)
  const tos = to.split(CHAR)
  for (let i = 0, max = Math.max(froms.length, tos.length); i < max; i++) {
    const fromV = +froms[i] || 0
    const toV = +tos[i] || 0
    if (fromV > toV) return -1
    if (fromV < toV) return 1
  }
  return 0
}

export default compareVersion