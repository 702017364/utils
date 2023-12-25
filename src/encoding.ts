const utf8_first_prefix = /^1{2,}/g
const utf8_other_prefix = /^10/

const Encodes = {
  UTF_8: 'utf-8',
  UTF_16LE: 'utf-16le',
  UTF_16BE: 'utf-16be',
  GBK: 'gbk'
} as const

const BOM = {
  UTF_8: [0xef, 0xbb, 0xbf],
  UTF_16LE: [0xff, 0xfe],
  UTF_16BE: [0xfe, 0xff],
} satisfies {
    [P in keyof typeof Encodes]?: number[]
  }

const equal = (uint: Uint8Array, list: number[]) => {
  return uint.length === list.length
    ? !uint.some((value, index) => value !== list[index])
    : false
}

type Encode<T> = Extract<T[keyof T], string>

/**
 * 根据文件内容判断文件的编码
 * @param uint 文件内容Uint8Array格式
 * @param limit 用于约束GBK和utf_8的判定上限
 */
export const getEncoding = (uint: Uint8Array, limit = 1024) => {
  let encoding!: Encode<typeof Encodes>
  let offset = 0
  for (const key in BOM) {
    const head = BOM[<keyof typeof BOM>key]
    if (equal(uint.slice(0, head.length), head)) {
      offset = head.length
      encoding = Encodes[<keyof typeof BOM>key]
      break
    }
  }
  if (!encoding) {
    let isBreak = false
    top:
    for (let i = 0, max = Math.min(uint.length, limit); i < max; i++) {
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