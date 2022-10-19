import { createFilter } from '@rollup/pluginutils'

export default function css(options = {}) {
  const filter = createFilter(options.include || ['**/*.css'], options.exclude)
  const styles = {}
  let output = options.output
  let name = options.name
  let fileName = options.fileName

  // Get all CSS modules in the order that they were imported
  const getCSSModules = (id, getModuleInfo, modules = new Set()) => {
    if (modules.has(id)) {
      return new Set()
    }

    if (filter(id)) modules.add(id)

    // Recursively retrieve all of imported CSS modules
    getModuleInfo(id).importedIds.forEach(importId => {
      modules = new Set(
        [].concat(
          Array.from(modules),
          Array.from(getCSSModules(importId, getModuleInfo, modules))
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
      const ids = []

      // Determine import order of files
      for (const file in bundle) {
        const root = bundle[file].facadeModuleId
        const modules = getCSSModules(root, this.getModuleInfo)
        ids.push(...Array.from(modules))
      }

      let css = ''

      // Combine all stylesheets, respecting import order
      for (const index in ids) {
        let id = ids[index]
        css += styles[id] + '\n' || ''
      }

      // Emit styles through callback
      if (typeof options.output === 'function') {
        options.output(css, styles, bundle)
        return
      }

      if (typeof output == 'string') {
        fileName = fileName || output
      }

      // Emit styles to file
      this.emitFile({ type: 'asset', name, fileName, source: css })
    }
  }
}
