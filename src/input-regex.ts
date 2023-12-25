const RE_REGEX = /[$()*+.[?\\^{|]/g
const RE_STRING = /[$()*+.[?\\^{|-]/g

/**
 * 处理输入文本中的特殊字符，用于转换正则表达式
 * @param text 
 * @param flags 表示输出正则表达式
 */
export function inputRegex(text: string, flags?: string): RegExp
/**
 * 处理输入文本中的特殊字符，用于转换正则表达式
 * @param text 
 * @param flags 表示输出字符串，该字符串将作为正则表达式的一部分
 */
export function inputRegex(text: string, flags: false): string
export function inputRegex(text: string, flags?: string | false) {
  return flags === false
    ? text.replace(RE_STRING, ($0) => '\\' + $0)
    : new RegExp(text.replace(RE_REGEX, ($0) => '\\' + $0), flags)
}