const spaces: Record<string, string> = {
  '\u000c': 'f',
  '\u000a': 'n',
  '\u000d': 'r',
  '\u0009': 't',
  '\u000b': 'v',
}

const RE_REGEX = /(^[\d\a-zA-Z]|[-,=<>#&!%:;@~'`" ])|([$\\.*+^?()[\]{}|/])|([\f\n\r\t\v])/g

/**
 * 处理输入文本中的特殊字符，用于转换正则表达式
 * @param text 
 * @param flags 表示输出正则表达式
 * @param polyfill 是否强制使用polyfill，默认为自动兼容，该参数主要在测试代码环境中使用
 */
export function inputRegex(text: string, flags?: string, polyfill?: boolean): RegExp
/**
 * 处理输入文本中的特殊字符，用于转换正则表达式
 * @param text 
 * @param flags 表示输出字符串，该字符串将作为正则表达式的一部分
 * @param polyfill 是否强制使用polyfill，默认为自动兼容，该参数主要在测试代码环境中使用
 */
export function inputRegex(text: string, flags: false, polyfill?: boolean): string
export function inputRegex(text: string, flags?: string | false, polyfill?: boolean) {
  const { escape } = RegExp
  
  const tmp = !polyfill && escape
    ? escape(text)
    : (
      text.replace(RE_REGEX, ($0, $1?: string, $2?: string) => (
        '\\' + ($1
          ? 'x' + $0.charCodeAt(0).toString(16)
          : $2
            ? $0
            : spaces[$0]
        )
      ))
    )
  
  return flags === false
    ? tmp
    : new RegExp(tmp, flags)
}