/**
 * 加载图片
 * @param src 
 */
export const loadImage = (src: string) => { 
  return new Promise<HTMLImageElement | null>((resolve) => { 
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}