import { createFilter } from '@rollup/pluginutils'

var arraysEqual = function(a, b) {
  if (a.length !== b.length) return false

  for (let i = a.length; i--;) {
    if (a[i] !== b[i]) return false
  }

  return true
}

export default function css(options = {}) {
  const filter = createFilter(options.include || ['**/*.css'], options.exclude)
  const styles = {}
  let dest = options.output
  let hasChanged = false
  let prevIds = []

  // Get all CSS modules in the order that they were imported
  const getCSSModules = (id, getModuleInfo, modules = new Set()) => {
    if (modules.has(id)) {
      return new Set()
    }
    
    if (filter(id)) modules.add(id)
    
    // Recursively retrieve all of imported CSS modules
    getModuleInfo(id).importedIds.forEach(importId => {
      modules = new Set([].concat(Array.from(modules), Array.from(getCSSModules(importId, getModuleInfo, modules))))
    });
  
    return modules
  };

  return {
    name: 'css',
    buildStart() {
      hasChanged = false
    },
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
      // If we are in transform block, we can assume styles[id] !== code, right?
      if (styles[id] !== code && (styles[id] || code)) {
        styles[id] = code
        hasChanged = true
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

      // If the files are imported in the same order and there are no changes
      // or options.output is false, there is no work to be done
      if (arraysEqual(prevIds, ids) && !hasChanged || options.output === false) return
      prevIds = ids

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

      if (typeof dest !== 'string') {
        // Don't create unwanted empty stylesheets
        if (!css.length) {
          return
        }

        // Guess destination filename
        dest =
          opts.file ||
          (Array.isArray(opts.output)
            ? opts.output[0].file
            : opts.output && opts.output.file) ||
          opts.dest ||
          'bundle.js'
        if (dest.endsWith('.js')) {
          dest = dest.slice(0, -3)
        }
        dest = dest + '.css'
      }

      // Emit styles to file
      this.emitFile({ type: 'asset', fileName: dest, source: css })
    }
  }
}
