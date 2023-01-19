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

      const { imports, codeWithoutImports } = splitImports(code);

      // When output is disabled, the stylesheet is exported as a string
      if (options.output === false) {
        if (imports.length === 0) {
          return {
            code: `export default ${JSON.stringify(code)}`,
            map: { mappings: '' }
          }
        }
        const importNamed = imports.map((d, i) => `import i${i} from ${d}`).join('\n');
        return {
          code: `
            ${importNamed}
            export default ${imports.map((_, i) => `i${i}`).join(' + ')} + ${JSON.stringify(codeWithoutImports)}`,
          map: { mappings: '' }
        }
      }

      // Keep track of every stylesheet
      // Check if it changed since last render
      // NOTE: If we are in transform block, we can assume styles[id] !== code, right?
      if (styles[id] !== codeWithoutImports && (styles[id] || codeWithoutImports)) {
        styles[id] = codeWithoutImports
      }

      // return a list of imports
      return imports.map((d) => `import ${d}`).join('\n');
    },
    generateBundle(opts, bundle) {
      const ids = []

      // Determine import order of files
      for (const file in bundle) {
        const root = bundle[file].facadeModuleId
        const modules = getCSSModules(root, this.getModuleInfo)
        ids.push(...Array.from(modules))
      }

      // Combine all stylesheets, respecting import order
      const css = ids.map(id => styles[id]).join('\n')

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


function splitImports(code) {
  const imports = [];
  const codeWithoutImports = code.replace(/@import\s+(.*);[\r\n]*/gm, (_, group) => {
    imports.push(group.replace(/(["'])~/, '$1'));
    return '';
  });
  return {
    imports,
    codeWithoutImports
  };
}