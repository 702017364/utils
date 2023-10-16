/**
 * 等待
 */
export default (delay = 0) =>
  new Promise<void>((resolve) => setTimeout(resolve, delay))