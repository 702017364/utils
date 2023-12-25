/**
 * 缓存函数返回值
 * @param callback 运行返回值的函数
 * @param thisArg 绑定到运行函数的this对象
 */
export const once = <T extends (...args: any) => any>(func: T, thisArg?: any) => {
  let local: ReturnType<T>
  let inited = false
  return (...list: Parameters<T>) => inited
    ? local
    : (
      inited = true,
      local = func.apply<any, Parameters<T>, ReturnType<T>>(thisArg, list)
    )
}