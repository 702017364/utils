import rollupAliasPlugin from '@rollup/plugin-alias'
import rollupCommonjsPlugin from '@rollup/plugin-commonjs'
import rollupJSONPlugin from '@rollup/plugin-json'
import rollupNodeResolvePlugin from '@rollup/plugin-node-resolve'
import rollupTypescriptPlugin from '@rollup/plugin-typescript'
import { execSync } from 'child_process'
import { type BuildOptions, build } from 'esbuild'
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs'
import { globSync } from 'glob'
import { cloneDeep } from 'lodash-es'
import { dirname, extname, join, parse, relative, sep } from 'path'
import { rimrafSync } from 'rimraf'
import { rollup } from 'rollup'
import { v4 } from 'uuid'
import { dependencies, devDependencies, name } from './package.json'
import { effects, re_effect } from './start'
import tsconfig from './tsconfig.template.json'
import { compilerOptions } from './tsconfig.test.json'

class Externals { 
  list = new Set<string>()

  constructor(private excludes?: RegExp) { 
    this.each(dependencies)
    this.each(devDependencies)
  }

  private each(data: Record<string, string>) { 
    const { excludes, list } = this
    for (const key in data) { 
      (excludes && excludes.test(key)) || list.add(key)
    }
  }
}

const getEntries = (root: string, ...list: Record<string, string[]>[]) => { 
  const entries: Record<string, string> = {}
  list.forEach((paths) => {
    for (const key in paths) {
      const [value] = (paths)[<keyof typeof paths>key]
      if (key.slice(-1) === '*') {
        entries[key.slice(0, -2)] = join(root, value.slice(0, -2))
      } else {
        entries[key] = join(root, value)
      }
    }
  })
  return entries
}

abstract class Environment { 
  protected root = process.cwd()
  
  protected define = {
    'process.env.npm_config_name': `"${name}"`,
  }

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

const re_relation = /import\s*\{([^}]+)\}\s*from\s*(['"])(\.[^'"]*)\2/mg

const re_as = /\s+as\s+/

const re_sep = new RegExp(`\\${sep}+`, 'g')

const re_import = /import\s*\{([^}]+)\}\s*from\s*(['"])(@vope\/utils)\2/

const getFileSrc = (value: string) => { 
  let file!: string
  [
    value + '.ts',
    value + '.d.ts',
    value + sep + 'index.ts',
    value + sep + 'index.d.ts',
  ].some((src) => { 
    if (existsSync(src)) { 
      file = src
      return true
    }
  })
  return file
}

class TestEnvironment extends Environment { 
  private tests = '__tests'

  private examples = '__examples'

  private files = globSync('./tests/**/*.ts')

  private testFiles: string[]

  private list: boolean[]

  private batch = 3

  private entries = getEntries(this.root, compilerOptions.paths)

  private external: string[]

  private table = this.getTable()

  constructor() { 
    super()
    const external = this.getExternals(/^(?:@vope\/|sm-crypto|localforage|lodash-es)/)
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
      if (!test) return true
      const originMtime = statSync(file).mtime
      const buildMtime = statSync(join(root, test)).mtime
      return originMtime > buildMtime || this.queryAssociateFiles(join(root, file)).some((file) => statSync(file).mtime >= buildMtime)
    })
  }

  private getTable() { 
    const dir = join(this.root, 'src')
    const content = readFileSync(join(dir, 'index.ts'), { encoding: 'utf-8' })
    const re_value = /\{(.+?)\}\s*from\s*(['"])(.+?)\2/
    return content.split('\n').reduce<Record<string, TableItem>>((caches, text) => {
      const matchs = text.match(re_value)
      if (!matchs) return caches
      matchs[1].split(',').forEach((target) => {
        const newTarget = target.trim()
        if (newTarget.slice(0, 5) === 'type ') {
          caches[newTarget.slice(5).trimStart()] = {
            src: matchs[3],
            isType: true,
          }
        } else if (re_as.test(newTarget)) {
          const [alia, key] = newTarget.split(re_as)
          caches[key] = {
            src: matchs[3],
            alia,
          }
        } else {
          caches[newTarget] = {
            src: matchs[3],
          }
        }
      })
      return caches
    }, {})
  }

  private parse(imports: string, callback: (src: string, values: string[]) => void, supplement?: (key: string, isType: boolean) => void) { 
    const { table } = this
    const caches: Record<string, string[]> = {}
    imports.split(',').forEach((target) => {
      const newTarget = target.trim()
      let isType = false
      let key
      if (newTarget.slice(0, 5) === 'type ') {
        key = newTarget.slice(5).trimStart()
        isType = true
      } else if (re_as.test(newTarget)) { 
        [key] = newTarget.split(re_as)
      } else {
        key = newTarget
      }
      supplement?.(key, isType)
      const { src } = table[key]
      const list = caches[src] || (caches[src] = [])
      list.push(key)
    })
    for (const src in caches) {
      callback(src, caches[src])
    }
  }

  private queryAssociateFiles(file: string) { 
    const { root } = this
    const code = readFileSync(file, { encoding: 'utf-8' })
    const matchs = code.match(re_import)
    if (!matchs) return []
    const memory = new Set<string>()
    this.parse(matchs[1], (src) => { 
      const file = join(root, 'src', src + '.ts')
      if (memory.has(file)) return
      memory.add(file)
      this.deepQueryAssociate(memory, file)
    })
    return Array.from(memory)
  }

  private deepQueryAssociate(memory: Set<string>, file: string) { 
    const { root, table } = this
    const code = readFileSync(file, { encoding: 'utf-8' })
    let exec: RegExpExecArray | null
    while ((exec = re_relation.exec(code)) !== null) {
      this.parse(exec[1], (src) => { 
        const file = getFileSrc(join(root, 'src', src))
        if (memory.has(file)) return
        memory.add(file)
        this.deepQueryAssociate(memory, file)
      }, (key, isType) => { 
        if (key in table) return
        let value = join(dirname(file), exec![3])
        table[key] = {
          src: './' + relative(join(root, 'src'), value).replace(re_sep, '/'),
          isType: isType,
        }
      })
    }
  }

  private BuildExamples() { 
    build<BuildOptions>({
      entryPoints: globSync('./examples/**/!(_*).ts'),
      format: 'iife',
      outdir: this.examples,
      outbase: 'examples',
      bundle: true,
      define: this.define,
      platform: 'browser',
      treeShaking: true,
    })
  }

  private async next(index: number): Promise<void> { 
    const { list, files, tests } = this
    if (index >= list.length) return
    if (list[index]) {
      list[index] = false
      const input = files[index]
      const build = await rollup({
        input,
        external: this.external,
        treeshake: true,
        plugins: [
          rollupAliasPlugin({
            entries: this.entries,
          }),
          rollupTypescriptPlugin({
            tsconfig: './tsconfig.test.json',
          }),
          rollupNodeResolvePlugin(),
          rollupCommonjsPlugin(),
          rollupJSONPlugin(),
        ]
      })
      const data = parse(input.split(sep).slice(1).join(sep))
      const file = data.dir + sep + data.name + '.js'
      await build.write({
        format: 'cjs',
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

interface EntryPoint { 
  cjs: string
  esm: string
}

interface Production { 
  entryPoint: string | EntryPoint
  outdir: string
  outbase: string
  effect?: boolean
}

interface Effect { 
  entryPoint: string
  outdir: string
  outbase: string
}

interface Package { 
  types: string
  import: string
  require: string
}

type TupleKV<T, V extends keyof T = keyof T> = [V, T[V]] 

const getEffect = (() => { 
  const data = effects.reduce<Record<string, Effect>>((caches, effect) => { 
    const data = effect.split(re_effect)
    caches[effect] = {
      entryPoint: effect,
      outdir: `sub_${data[1]}`,
      outbase: data.slice(0, 2).join(sep),
    }
    return caches
  }, {})

  return (effect: string) => { 
    return data[effect]
  }
})()

const formatterPath = (path: string) =>
  path.replaceAll('\\', '/')

class ProductionEnvironment extends Environment { 
  private dist = 'dist'

  private mjs = '.js'

  private cjs = '.cjs.js'

  private async buildESM(entryPoints: string[], outdir: string, outbase: string) { 
    await build<BuildOptions>({
      entryPoints,
      outbase,
      format: 'esm',
      outdir,
      define: this.define,
      platform: 'browser',
      outExtension: {
        '.js': this.mjs,
      },
    })
  }

  private async buildCJS(entryPoints: string[], outdir: string, outbase: string) { 
    await build<BuildOptions>({
      entryPoints: entryPoints,
      outbase,
      format: 'cjs',
      outdir,
      bundle: true,
      define: this.define,
      external: Array.from(this.getExternals(/^@vope\//)),
      treeShaking: true,
      outExtension: {
        '.js': this.cjs,
      },
    })
  }

  private buildTS(entryPoint: string, outdir: string, outbase: string, effect?: boolean) { 
    const file = join(__dirname, `tsconfig._${v4().replaceAll('-', '_')}.json`)
    const newTsconfig = cloneDeep(tsconfig)
    const { compilerOptions } = newTsconfig
    compilerOptions.declarationDir = outdir
    compilerOptions.rootDir = outbase
    const list = entryPoint.split(re_effect)
    const lastValue = list[list.length - 1]
    list[0][0] === '.' && list.shift()
    if (lastValue === '*.ts') {
      list[list.length - 1] = '*.ts'
    } else if (extname(lastValue) === '.ts') { 
      list[list.length - 1] = '**/*.ts'
    }
    const include = list.join('/')
    newTsconfig.include.push(include)
    writeFileSync(file, JSON.stringify(newTsconfig, void 0, 2), { encoding: 'utf-8' })
    try {
      execSync(`tsc -p ./${file}`)
      const { root } = this
      const files = globSync(formatterPath(join(dirname(include), '*.d.ts')), {
        ignore: effect
          ? void 0
          : effects.map((effect) => {
            return extname(effect) === '.ts'
              ? formatterPath(join(dirname(effect), '**', '*.d.ts'))
              : effect
          }),
      })
      const outbase = list.filter((text) => !text.includes('*')).join(sep)
      files.forEach((file) => {
        const list = relative(outbase, file).split(sep)
        const dir = join(root, outdir, ...list.slice(0, -1))
        existsSync(dir) || mkdirSync(dir)
        copyFileSync(join(root, file), join(dir, list[list.length - 1]))
      })
      rmSync(file)
    } catch (e) { 
      rmSync(file)
      throw e
    }
  }

  private buildPackage(entryPoint: string, outdir: string) { 
    const { name } = parse(entryPoint)
    if (name.includes('*')) return
    const dir = join(this.root, outdir)
    const list: TupleKV<Package>[] = [
      ['types', name + '.d.ts'],
      ['import', name + this.mjs],
      ['require', name + this.cjs],
    ]
    const data = {} as Package
    let count = 0
    list.forEach(([key, value]) => { 
      if (existsSync(join(dir, value))) { 
        count++
        data[key] = value
      }
    })
    count && writeFileSync(join(dir, 'package.json'), JSON.stringify(data, null, 2))
  }

  build() { 
    const hash = globSync(effects).reduce<Record<string, string>>((caches, file) => { 
      caches[file] = file
      return caches
    }, {})
    const list: Production[] = [
      {
        entryPoint: {
          esm: './src/**/*.ts',
          cjs: './src/index.ts',
        },
        outbase: 'src',
        outdir: this.dist,
      },
    ]
    effects.forEach((effect) => { 
      const data = getEffect(effect)
      list.push({
        entryPoint: data.entryPoint,
        outdir: data.outdir,
        outbase: data.outbase,
        effect: true,
      })
    })
    list.forEach(async ({ entryPoint, outdir, effect, outbase }) => { 
      if (typeof entryPoint === 'string') { 
        entryPoint = { esm: entryPoint, cjs: entryPoint }
      }
      const esm = globSync(entryPoint.esm, {
        ignore: '**/*.d.ts',
      })
      const cjs = globSync(entryPoint.cjs, {
        ignore: '**/*.d.ts',
      })
      await Promise.all([
        this.buildESM(
          effect ? esm : esm.filter((value) => value in hash === false),
          outdir,
          outbase,
        ),
        this.buildCJS(
          effect ? cjs : cjs.filter((value) => value in hash === false),
          outdir,
          outbase,
        ),
        this.buildTS(entryPoint.esm, outdir, outbase, effect),
      ])
      effect && this.buildPackage(entryPoint.cjs, outdir)
    })
  }

  clear() { 
    rimrafSync([
      this.dist,
      ...effects.map((effect) => getEffect(effect).outdir),
    ])
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