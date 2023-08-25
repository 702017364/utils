import typescript from '@rollup/plugin-typescript'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmdirSync, statSync, unlinkSync, writeFileSync } from 'fs'
import { join, parse, relative } from 'path'
import { Plugin, rollup } from 'rollup'

interface Item {
  dir: string
  file: string
}

interface Group { 
  key: string
  value: string
}

type Options = { type?: string } & { [key: string]: number }

const re_from = /from\s+('|")(\.[^'"]+)\1(?=[;\n\r])/g
const re_file = /\.d\.ts$/

const root = process.cwd()

const CONFIG_FILE = '.config'

const pair = /^(?<key>\w+(?:[/\\]+[-\w]+)*)\s*=\s*(?<value>[^\r\n]*)/mg

const re_split = /\\+|\/+/g

const defaults = {
  type: 'test',
}

class Build { 
  constructor(private origin: string, private target: string, private isConfig: boolean = true) { }

  private getTarget(dir: string, callback: (dir: string, file: string) => void) { 
    const path = join(root, dir)
    readdirSync(path).forEach((file) => { 
      const target = join(path, file)
      if (statSync(target).isDirectory()) {
        this.getTarget(join(dir, file), callback)
      } else { 
        callback(dir, file)
      }
    })
  }
  
  private getTargets() {
    const manage = new Manage()
    try {
      this.getTarget(this.target, (dir, file) => {
        file !== CONFIG_FILE && manage.add(dir, file)
      })
    } catch { }
    return manage
  }

  private getOptions() { 
    try {
      const data = readFileSync(join(root, this.target, CONFIG_FILE), 'utf-8')
      const options: Options = {}
      let exec: RegExpExecArray | null = null
      while ((exec = pair.exec(data)) !== null) { 
        const { key, value } = exec.groups as unknown as Group
        if (key === 'type') {
          options.type = value
        } else {
          const val = +value
          val && (options[key] = val)
        }
      }
      return options
    } catch { 
      return {}
    }
  }

  private setOptions(data: Options) { 
    let text = ''
    for (const key in data) { 
      text += key + ' = ' + data[key] + '\r\n'
    }
    if (!text) return
    const dir = join(root, this.target)
    existsSync(dir) || mkdirSync(dir)
    writeFileSync(join(dir, CONFIG_FILE), text, {
      encoding: 'utf-8',
      flag: 'w+',
    })
  }

  private deep(relative: string, callback: (dir: string, file: string) => void) { 
    const path = join(root, relative)
    readdirSync(path).forEach((file) => { 
      if (re_file.test(file)) return
      const src = join(path, file)
      if (statSync(src).isDirectory()) {
        this.deep(join(relative, file), callback)
      } else {
        callback(relative, file)
      }
    })
  }

  private toTarget(src: string) { 
    const { dir, name } = parse(relative(this.origin, src))
    return join(this.target, dir, name + '.js')
  }

  traverse() { 
    const { isConfig } = this
    const options = isConfig ? this.getOptions() : {}
    const manage = this.getTargets()
    const newOptions = {
      type: defaults.type,
    } as Options
    const list: Item[] = []
    this.deep(this.origin, (dir, file) => { 
      const src = join(dir, file)
      const path = join(root, src)
      const key = src.slice(0, parse(src).ext.length * -1)
      const time = statSync(path).mtime.getTime()
      const target = this.toTarget(src)
      if (!isConfig) {
        list.push({ dir, file })
      } else if (time !== options[key]) {
        list.push({ dir, file })
        if (manage.delete(dir, file) === 0) {
          try {
            rmdirSync(dir)
          } catch { }
        }
      } else if (!manage.has(target)) {
        list.push({ dir, file })
      } else { 
        const { dir, name, ext } = parse(target) 
        manage.delete(dir, name + ext)
      }
      newOptions[key] = time
    })
    isConfig && this.setOptions(newOptions)
    return { list, manage }
  }

  async generator() { 
    const { list, manage } = this.traverse()
    for (const src of manage.values()) { 
      const { dir, name, ext } = parse(src)
      unlinkSync(join(root, src))
      if (manage.delete(dir, name + ext) === 0 && dir !== this.target) { 
        try {
          rmdirSync(join(root, dir))
        } catch { }
      }
    }
    for (const { dir, file } of list) { 
      const input = join(root, dir, file)
      const result = await rollup({
        input,
        external() {
          return true
        },
        plugins: [
          typescript(),
          test(),
        ],
      })
      result.write({
        dir: join(root, this.target, ...dir.split(re_split).slice(1)),
        format: 'module',
      })
      console.log(`Rollp Compiled ${input}`)
    }
  }
}

const test = (): Plugin => ({
  name: 'test-plugin',
  transform(code) {
    return code.replace(re_from, ($0, $1, $2: string) => `from "${$2}.js"`)
  },
})

class Manage { 
  private sizes = new Map<string, number>()
  private list = new Set<string>()

  add(dir: string, file: string) { 
    const { sizes } = this
    sizes.set(dir, (sizes.get(dir) || 0) + 1)
    this.list.add(join(dir, file))
  }

  has(src: string) { 
    return this.list.has(src)
  }

  delete(dir: string, file: string) {
    if (this.list.delete(join(dir, file))) { 
      const { sizes } = this
      const size = sizes.get(dir)! - 1
      size
        ? sizes.set(dir, size)
        : sizes.delete(dir)
      return size
    }
    return -1
  }

  values() { 
    return this.list.values()
  }
}

new Build('src', 'lib').generator()
new Build('tests', '__tests').generator()