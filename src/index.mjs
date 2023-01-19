import { createFilter } from '@rollup/pluginutils'

export default function css(options = {}) {
  const filter = createFilter(options.include || ['**/*.css'], options.exclude)
  const styles = {}
  let output = options.output
  let name = options.name
  let fileName = options.fileName

  // Get all CSS modules in the order that they were imported
  const getCSSModules = (id, getModuleInfo) => {
    const modules = [];
    const visited = new Set();

    // traversal logic
    // 1. mark node as visited
    // 2. add to list at the end
    // 3. go down with imports but in reverse order
    // 4. reverse full list
    // example
    // root
    //  1
    //   11
    //   12
    //  2
    //   21
    //   22
    // will result in the list: root, 2, 22, 21, 1, 12, 11
    // revered: 11, 12, 1, 21, 22, 2, root
    const visitModule = (id) => {
      if (visited.has(id)) {
        return;
      }
      visited.add(id);
      if (filter(id)) {
        modules.push(id);
      }
      const reverseChildren = getModuleInfo(id).importedIds.slice().reverse();
      reverseChildren.forEach(visitModule);
    }
    visitModule(id);
    return modules.reverse();
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