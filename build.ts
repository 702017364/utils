import { exec } from 'child_process'
import { build } from 'esbuild'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { globSync } from 'glob'
import { join, sep } from 'path'
import { rimrafSync } from 'rimraf'
import { dependencies, devDependencies } from './package.json'

const path = process.cwd()

const excludes = /^@vope\//
const list: string[] = []
for (const key in dependencies) {
  excludes.test(key) || list.push(key)
}
for (const key in devDependencies) {
  excludes.test(key) || list.push(key)
}

if (process.env.npm_config_type === 'test' || (() => {
  const re_argv = /^--type=([a-z]+)$/
  let type: NodeJS.ProcessEnv['npm_config_type']
  process.argv.some((text) => {
    const matchs = text.match(re_argv)
    if (matchs) {
      type = matchs[1] as NodeJS.ProcessEnv['npm_config_type']
      return true
    }
  })
  return type
})() === 'test') {
  const tests = '__tests'

  rimrafSync([tests])

  build({
    entryPoints: globSync('./tests/**/*.ts'),
    format: 'esm',
    outdir: tests,
    bundle: true,
    platform: 'node',
    external: list,
  })
} else { 
  const esm = 'lib'

  const cjs = 'cjs'

  const types = 'types'

  rimrafSync([esm, cjs, types])
  
  build({
    entryPoints: globSync('./src/**/*.ts'),
    format: 'esm',
    outdir: esm,
    platform: 'browser',
  })
  
  build({
    entryPoints: ['./src/index.ts'],
    format: 'cjs',
    outdir: cjs,
    bundle: true,
    external: list,
  })
  
  exec('tsc -p ./tsconfig.types.json', (error) => { 
    if (error) throw error
    globSync('./src/**/*.d.ts').forEach((file) => { 
      const list = file.split(sep).slice(1)
      const dir = join(path, types, ...list.slice(0, -1))
      existsSync(dir) || mkdirSync(dir)
      copyFileSync(join(path, file), join(dir, list[list.length - 1]))
    })
  })
}