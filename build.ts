import rollupAliasPlugin from '@rollup/plugin-alias'
import rollupCommonjsPlugin from '@rollup/plugin-commonjs'
import rollupJSONPlugin from '@rollup/plugin-json'
import rollupNodeResolvePlugin from '@rollup/plugin-node-resolve'
import rollupTypescriptPlugin from '@rollup/plugin-typescript'
import { exec } from 'child_process'
import { build } from 'esbuild'
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'fs'
import { globSync } from 'glob'
import { join, parse, relative, sep } from 'path'
import { rimrafSync } from 'rimraf'
import { Plugin, rollup } from 'rollup'
import { dependencies, devDependencies, name } from './package.json'
import { compilerOptions } from './tsconfig.json'

class Externals { 
  list!: Set<string>

  constructor(private excludes?: RegExp) { 
    this.each(dependencies)
    this.each(devDependencies)
  }

  private each(data: Record<string, string>) { 
    const { excludes } = this
    const list = new Set<string>()

    for (const key in data) { 
      (excludes && excludes.test(key)) || list.add(key)
    }

    this.list = list
  }
}

const getEntries = (root: string) => { 
  const { paths } = compilerOptions
  const entries: Record<string, string> = {}
  for (const key in paths) {
    const [value] = (paths)[<keyof typeof paths>key]
    if (key.slice(-1) === '*') {
      entries[key.slice(0, -2)] = join(root, value.slice(0, -2))
    } else {
      entries[key] = join(root, value)
    }
  }
  return entries
}

abstract class Environment { 
  protected root = process.cwd()

  protected getExternals(excludes?: RegExp) { 
    return new Externals(excludes).list
  }

  abstract clear(): void | Promise<void>

  abstract build(): void | Promise<void>
}

interface TableItem { 
  src: string
  isType?: boolean
  alia?: string 
}

class TestEnvironment extends Environment { 
  private tests = '__tests'

  private examples = '__examples'

  private files = globSync('./tests/**/*.ts')

  private testFiles: string[]

  private list: boolean[]

  private batch = 3

  private entries = getEntries(this.root)

  private external: string[]

  private rollupLoadUtilsPlugin = this.createRollupLoadUtilsPlugin()

  constructor() { 
    super()
    const external = this.getExternals(/^(?:@vope\/|sm-crypto|localforage)/)
    external.add('assert')
    external.add('fs')
    external.add('path')
    this.external = Array.from(external)
    this.testFiles = globSync(`./${this.tests}/**/*`)
    this.list = this.getList()
  }

  private getList() { 
    const { root, tests } = this
    const locals = this.testFiles.reduce<Record<string, string>>((caches, file) => { 
      caches[relative(tests, file)] = file
      return caches
    }, {})
    return this.files.map((file) => { 
      const data = parse(relative('tests', file))
      const test = locals[join(data.dir, data.name + '.js')]
      if (!test) return false
      return statSync(join(root, file)).mtime < statSync(join(root, test)).mtime
    })
  }

  private createRollupLoadUtilsPlugin(): Plugin { 
    const dir = join(this.root, 'src')
    const content = readFileSync(join(dir, 'index.ts'), { encoding: 'utf-8' })
    const re_value = /\{(.+?)\}\s*from\s*(['"])(.+?)\2/
    const re_as = /\s+as\s+/
    const table = content.split('\n').reduce<Record<string, TableItem>>((caches, text) => {
      const matchs = text.match(re_value)
      if (!matchs) return caches
      matchs[1].split(',').forEach((target) => {
        const newTarget = target.trim()
        if (newTarget.slice(0, 5) === 'type ') {
          caches[newTarget.slice(5)] = {
            src: matchs[3],
            isType: true
          }
        } else if (re_as.test(newTarget)) {
          const [alia, key] = newTarget.split(re_as)
          caches[key] = {
            src: matchs[3],
            alia
          }
        } else {
          caches[newTarget] = {
            src: matchs[3]
          }
        }
      })
      return caches
    }, {})
    const re_import = /import\s*\{([^}]+)\}\s*from\s*(['"])(@vope\/utils)\2/g
    return {
      name,
      transform(code, id) {
        if (!id.includes('tests'))
          return
        const newCode = code.replace(re_import, ($0, $1: string, $2: string, $3: string) => {
          const caches: Record<string, string[]> = {}
          $1.split(',').forEach((target) => {
            const newTarget = target.trim()
            let key
            if (newTarget.slice(0, 5) === 'type ') {
              key = newTarget.slice(5)
            } else {
              key = newTarget
            }
            const { src } = table[key]
            const list2 = caches[src] || (caches[src] = [])
            list2.push(key)
          })
          const list = []
          for (const src in caches) {
            list.push(`import {${caches[src].map((key) => {
              const data = table[key]
              if (data.isType) {
                return `type ${key}`
              } else if (data.alia) {
                return `${data.alia} as ${key}`
              } else {
                return key
              }
            }).join(',')}} from "@${src.slice(1)}"`)
          }
          return list.join('\n')
        })
        return newCode
      }
    }
  }

  private BuildExamples() { 
    build({
      entryPoints: globSync('./examples/**/!(_*).ts'),
      format: 'iife',
      outdir: this.examples,
      outbase: 'examples',
      bundle: true,
      platform: 'browser',
      treeShaking: true,
    })
  }

  private async next(index: number): Promise<void> { 
    const { list, files, tests } = this
    if (index >= list.length) return
    if (!list[index]) {
      list[index] = true
      const input = files[index]
      const build = await rollup({
        input,
        external: this.external,
        treeshake: true,
        plugins: [
          this.rollupLoadUtilsPlugin,
          rollupAliasPlugin({
            entries: this.entries,
          }),
          rollupTypescriptPlugin(),
          rollupNodeResolvePlugin(),
          rollupCommonjsPlugin(),
          rollupJSONPlugin(),
        ]
      })
      const data = parse(input.split(sep).slice(1).join(sep))
      const file = data.dir + sep + data.name + '.js'
      await build.write({
        format: 'esm',
        file: join(this.root, tests, file)
      })
      console.log(`\x1b[33m${join(tests, file)}\x1b[0m \x1b[34mCompilation completed\x1b[0m`)
    }
    return this.next(index + 1)
  }

  private async BuildTests() {
    const tasks: Promise<void>[] = []
    for (let i = 0, j = Math.min(this.files.length, this.batch); i < j; i++) {
      tasks.push(this.next(i))
    }
    await Promise.all(tasks)
  }

  async build() { 
    this.BuildExamples()
    await this.BuildTests()
  }

  clear() { 
    rimrafSync([this.examples])
  }
}

class ProductionEnvironment extends Environment { 
  private esm = 'lib'

  private cjs = 'cjs'

  private types = 'types'

  private buildESM() { 
    build({
      entryPoints: globSync('./src/**/*.ts'),
      outbase: 'src',
      format: 'esm',
      outdir: this.esm,
      platform: 'browser',
    })
  }

  private buildCJS() { 
    build({
      entryPoints: ['./src/index.ts'],
      format: 'cjs',
      outdir: this.cjs,
      bundle: true,
      external: Array.from(this.getExternals(/^@vope\//)),
      treeShaking: true,
    })
  }

  private buildTS() { 
    exec('tsc -p ./tsconfig.types.json', (error) => { 
      if (error) throw error
      const { root } = this
      globSync('./src/**/*.d.ts').forEach((file) => { 
        const list = file.split(sep).slice(1)
        const dir = join(root, this.types, ...list.slice(0, -1))
        existsSync(dir) || mkdirSync(dir)
        copyFileSync(join(root, file), join(dir, list[list.length - 1]))
      })
    })
  }

  build() { 
    this.buildESM()
    this.buildCJS()
    this.buildTS()
  }

  clear() { 
    rimrafSync([this.esm, this.cjs, this.types])
  }
}

class Build { 
  private test = 'test' as const

  private getType() { 
    if (process.env.npm_config_type === this.test) return this.test
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
  }

  async initialize() { 
    let environment: Environment
    if (this.getType() === this.test) {
      environment = new TestEnvironment()
    } else { 
      environment = new ProductionEnvironment()
    }
    await environment.clear()
    await environment.build()
  }
}

new Build().initialize()