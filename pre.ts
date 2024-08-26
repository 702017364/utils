import { parse as Parse } from '@babel/parser'
import traverse from '@babel/traverse'
import { isClassDeclaration, isExportSpecifier, isFunctionDeclaration, isIdentifier, isTSInterfaceDeclaration, isTSModuleDeclaration, isTSTypeAliasDeclaration, isVariableDeclaration } from '@babel/types'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join, parse, relative, resolve } from 'path'

interface Item {
  name: string
  isTS?: boolean,
  default?: boolean
}

const ESM = <T extends object>(data: T) => {
  return 'default' in data
    ? data.default as T
    : data
}

(() => { 
  const root = resolve(process.cwd(), 'src')

  const exclude = join(root, 'index.ts')
  
  const re_file = /(?<!\.d)\.ts$/
  const re_name = /^(?!_)/
  const re_horizontal = /-(\w)/g
  const re_path = /\\+|\/{2,}/g

  const list: [string, Item[]][] = []
  let count = 0
  const push = (index: number, path: string, data: Item) => { 
    const { name } = data
    if (name.slice(0, 1) === '_') return
    const from = './' + relative(root, path).replace(re_path, '/')
    const items = (list[index] || (list[index] = [from.slice(0, -3), []]))
    if (data.default) { 
      data.name = name.replace(re_horizontal, ($0, $1: string) => $1.toLocaleUpperCase())
    }
    items[1].push(data)
  }
  
  const hunt = (path: string) => { 
    readdirSync(path, { encoding: 'utf-8' }).forEach((file) => { 
      const index = count++
      const src = resolve(path, file)
      if (src === exclude) return
      if (statSync(src).isDirectory()) {
        hunt(src)
      } else if (re_name.test(file) && re_file.test(file)) { 
        const code = readFileSync(src, { encoding: 'utf-8' })
        if (!code) return
        const ast = Parse(code, {
          sourceType: 'module',
          plugins: [
            ['typescript', {}]
          ],
        })
        ESM(traverse)(ast, {
          ExportNamedDeclaration({ node: { declaration, specifiers }, scope: { bindings } }) { 
            if (declaration) {
              if (isVariableDeclaration(declaration)) {
                const lval = declaration.declarations[0].id
                if (isIdentifier(lval)) {
                  push(index, src, { name: lval.name })
                }
              } else if (isFunctionDeclaration(declaration) || isClassDeclaration(declaration)) {
                push(index, src, { name: declaration.id!.name })
              } else if (isTSTypeAliasDeclaration(declaration) || isTSInterfaceDeclaration(declaration)) {
                push(index, src, {
                  name: declaration.id.name,
                  isTS: true,
                })
              } else if (isTSModuleDeclaration(declaration)) { 
                const { id } = declaration
                if (isIdentifier(id) && id.name in bindings === false) { 
                  push(index, src, {
                    name: id.name,
                    isTS: true,
                  })
                }
              }
            } else { 
              specifiers.forEach((specifier) => { 
                if (isExportSpecifier(specifier)) {
                  const { exported, local } = specifier
                  if (isIdentifier(exported)) {
                    const isDef = exported.name === 'default'
                    push(index, src, {
                      name: isDef ? parse(file).name : exported.name,
                      default: isDef,
                      isTS: specifier.exportKind === 'type' || local.name in bindings === false,
                    })
                  }
                }
              })
            }
          },
          ExportDefaultDeclaration({ node: { declaration } }) { 
            if (isIdentifier(declaration)) {
              push(index, src, {
                name: declaration.name,
                default: true,
              })
            } else if (isFunctionDeclaration(declaration) || isClassDeclaration(declaration)) {
              push(index, src, {
                name: declaration.id!.name,
                default: true,
              })
            } else { 
              push(index, src, {
                name: parse(file).name,
                default: true,
              })
            }
          }
        })
      }
    })
  }

  hunt(root)

  const data = list.reduce((caches, [from, items]) => { 
    const groups = items.reduce((caches, data) => { 
      const name = data.default
        ? `default as ${data.name}`
        : data.isTS
          ? 'type\u0020' + data.name
          : data.name
      return caches
        ? caches + ',\u0020' + name
        : name
    }, '')
    const content = `export { ${groups} } from '${from}'\n`
    return caches + content
  }, '')
  writeFileSync(resolve(root, 'index.ts'), data, {
    encoding: 'utf-8',
    flag: 'w+',
  })
})()