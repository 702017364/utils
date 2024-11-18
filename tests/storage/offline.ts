import { OfflineRequest, serializes } from '@examples/storage/offline/_utils'
import { cubeURLParams } from '@vope/utils'
import { deepStrictEqual } from 'assert'
import { readFileSync } from 'fs'
import { join } from 'path'
import { Browser, HTTPRequest, executablePath, launch } from 'puppeteer'

describe('class OfflineStorage', async function () { 
  this.timeout(5e5)

  let __browser__: Browser

  const createBrowser = async () => { 
    if (__browser__) return __browser__
    return __browser__ = await launch({
      headless: false,
      executablePath: executablePath(),
      defaultViewport: null,
      args: [
        '--start-maximized',
      ],
      devtools: true,
    })
  }

  let __count__ = 0

  const createPage = async (requestCallback?: (request: HTTPRequest) => void) => { 
    const browser = await createBrowser()
    const page = __count__
      ? await browser.newPage()
      : (await browser.pages())[0] || await browser.newPage()
    __count__++
    await page.setRequestInterception(true)
    const exclude = /\.(js|css|png|jpe?g|git)(\?(\w+=\w+)+)?$/
    page.on('request', (request) => {
      if (exclude.test(request.url())) {
        request.abort()
      } else if (requestCallback) {
        requestCallback(request)
      } else { 
        request.continue()
      }
    })
    await page.goto('https://baidu.com/')
    return page
  }

  const directory = join(process.cwd(), '__examples')

  it('push()', async () => { 
    const data = await new Promise<OfflineRequest>(async (resolve) => { 
      const page = await createPage((request) => { 
        if (request.url() === request.headers()['origin'] + '/offline-storage') {
          request.respond({
            status: 200,
            body: 'OK',
          })
          resolve(cubeURLParams<OfflineRequest, typeof serializes>(request.postData()!, serializes))
        } else { 
          request.continue()
        }
      })
      await page.addScriptTag({
        content: readFileSync(join(directory, 'storage/offline/push.js'), { encoding: 'utf-8' }),
      })
    })
    deepStrictEqual<OfflineRequest>(data, {
      size1: 2,
      key1_name: '张三',
      size2: 3,
      key2_name: '李四',
      size3: 4,
    })
  })

  this.afterAll((done) => { 
    createBrowser().then(async (browser) => { 
      await browser.close()
      done()
    })
  })
})