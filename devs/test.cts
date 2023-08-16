import typescript from '@rollup/plugin-typescript'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import { Plugin, rollup } from 'rollup'

interface Item {
  dir: string
  file: string
}

const re_from = /from\s+('|")(\.[^'"]+)\1(?=[;\n\r])/g
const re_file = /\.d\.ts$/

const test = (): Plugin => ({
  name: 'test-plugin',
  transform(code) {
    return code.replace(re_from, ($0, $1, $2: string) => `from "${$2}.js"`)
  },
});

(() => {
  const build = async (origin: string, target: string) => {
    const root = process.cwd()
    const list: Item[] = []

    const deep = (relative: string) => {
      const path = join(root, relative)
      readdirSync(path).forEach((file) => {
        if (re_file.test(file)) return
        const src = join(path, file)
        if (statSync(src).isDirectory()) {
          deep(join(relative, file))
        } else {
          list.push({ dir: relative, file })
        }
      })
    }

    deep(origin)

    const re_split = /\\+|\/+/g

    for (let i = 0, j = list.length; i < j; i++) {
      const { dir, file } = list[i]
      const result = await rollup({
        input: join(root, dir, file),
        external() {
          return true
        },
        plugins: [
          typescript(),
          test(),
        ],
      })
      result.write({
        dir: join(target, ...dir.split(re_split).slice(1)),
        format: 'module',
      })
    }
  }

  
  build('src', 'lib')
  build('tests', '__tests')
})()