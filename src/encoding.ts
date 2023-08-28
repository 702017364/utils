const utf8_first_prefix = /^1{2,}/g
const utf8_other_prefix = /^10/

enum Encodes { 
  UTF_8 = 'utf-8',
  UTF_16LE = 'utf-16le',
  UTF_16BE = 'utf-16be',
  GBK = 'gbk'
}

const defaults = {
  utf8: [0xef, 0xbb, 0xbf],
}

const equal = (uint: Uint8Array, list: number[]) => { 
  if (uint.length !== list.length) return false
  return !uint.some((value, index) => value !== list[index])
}

/**
 * 根据文件内容判断文件的编码
 * @param uint 文件内容Uint8Array格式
 * @param limit 用于约束GBK和utf_8的判定上限
 */
const getEncoding = (uint: Uint8Array, limit = 1024) => { 
  let encoding!: Encodes
  let offset = 0
  if (equal(uint.slice(0, 3), defaults.utf8)) {
    offset = defaults.utf8.length
    encoding = Encodes.UTF_8
  } else if (equal(uint.slice(0, 2), [0xff, 0xfe])) {
    encoding = Encodes.UTF_16LE
  } else if (equal(uint.slice(0, 2), [0xfe, 0xff])) {
    encoding = Encodes.UTF_16BE
  } else {
    let isBreak = false
    top:
    for (let i = 0; i < Math.min(uint.length, limit); i++) {
      const data = uint[i]
      if (data < 128) continue
      const match = data.toString(2).match(utf8_first_prefix)
      if (match) {
        for (let m = 0; m < match[0].length - 1; m++) {
          const target = uint[++i]
          if (target == void 0 || !utf8_other_prefix.test(target.toString(2))) {
            encoding = Encodes.GBK
            isBreak = true
            break top
          }
        }
      } else {
        encoding = Encodes.GBK
        isBreak = true
        break
      }
    }
    isBreak || (encoding = Encodes.UTF_8)
  }
  return { encoding, offset }
}

export default getEncoding