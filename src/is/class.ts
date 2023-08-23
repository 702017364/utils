interface Proto {
  constructor: Function
}

const re_anonymous = /^function\s+\(|^function\s+anonymous\(/
const re_function = /^function\s+[A-Z]/
const re_this = /\b\(this\b|\bthis[\.\[]\b/
const re_check = /classCallCheck\(this/
const re_default = /^function\sdefault_\d+\s*\(/

/**
 * 检测是否为class
 */
const isClass = (value: any, strict = true): value is new (...args: any) => any => { 
  if (typeof value !== 'function') return false
  const proto: Proto | undefined = (<Function>value).prototype
  if (!proto || proto.constructor !== value) return false
  const str: string = value.toString()
  if (str.slice(0, 5) === 'class'
    || Object.getOwnPropertyNames(proto).length >= 2) return true
  if (re_anonymous.test(str)) return false
  if (strict && re_function.test(str)) return true
  if (re_this.test(str)) { 
    if (!strict || re_check.test(str)) return true
    return re_default.test(str)
  }
  return false
}

export default isClass