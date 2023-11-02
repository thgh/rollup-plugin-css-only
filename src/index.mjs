import { createFilter } from '@rollup/pluginutils'

export default function css(options = {}) {
  const filter = createFilter(options.include || ['**/*.css'], options.exclude)
  const styles = {}
  let output = options.output
  let name = options.name
  let fileName = options.fileName

  // Get all CSS modules in the order that they were imported
  const getCSSModules = (id, getModuleInfo, modules = new Set(), visitedModules = new Set()) => {
    if (modules.has(id) || visitedModules.has(id)) {
      return new Set()
    }

    if (filter(id)) modules.add(id)

    // Prevent infinite recursion with circular dependencies
    visitedModules.add(id);

    // Recursively retrieve all of imported CSS modules
    const info = getModuleInfo(id)
    if (!info) return modules

    info.importedIds.forEach(importId => {
      modules = new Set(
        [].concat(
          Array.from(modules),
          Array.from(getCSSModules(importId, getModuleInfo, modules, visitedModules))
        )
      )
    })

    return modules
  }

  return {
    name: 'css',
    transform(code, id) {
      if (!filter(id)) {
        return
      }

      // When output is disabled, the stylesheet is exported as a string
      if (options.output === false) {
        return {
          code: 'export default ' + JSON.stringify(code),
          map: { mappings: '' }
        }
      }

      // Keep track of every stylesheet
      // Check if it changed since last render
      // NOTE: If we are in transform block, we can assume styles[id] !== code, right?
      if (styles[id] !== code && (styles[id] || code)) {
        styles[id] = code
      }

      return ''
    },
    generateBundle(opts, bundle) {
      const ids = new Set()

      // Determine import order of files
      for (const file in bundle) {
        const root = bundle[file].facadeModuleId
        const modules = getCSSModules(root, this.getModuleInfo)
        modules.forEach(id => ids.add(id))
      }

      // Combine all stylesheets, respecting import order
      const css = Array.from(ids).map(id => styles[id]).join('\n')

      // Emit styles through callback
      if (typeof options.output === 'function') {
        options.output(css, styles, bundle)
        return
      }

      if (typeof output == 'string') {
        fileName = fileName || output
      }

      // Emit styles to file
      this.emitFile({ type: 'asset', name, fileName, source: css + '\n' })
    }
  }
}
