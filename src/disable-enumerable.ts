/**
 * 设置对象属性为不可枚举
 * @description 适用场景：属性被当做临时过渡值，最终结果不需要出现在展开运算符的结果中
 * @param data 需要设置的对象
 * @param key 需要设为不可枚举的属性键
 */
export default <T extends object, K extends keyof T>(data: T, key: K) => { 
  const descriptor = Object.getOwnPropertyDescriptor(data, key) || {
    configurable: true,
    writable: true,
  } satisfies PropertyDescriptor
  Object.defineProperty(data, key, {
    ...descriptor,
    enumerable: false,
  })
}