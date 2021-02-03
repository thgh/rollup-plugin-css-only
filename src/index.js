import { createFilter } from '@rollup/pluginutils'

export default function css(options = {}) {
  const filter = createFilter(options.include || ['**/*.css'], options.exclude)
  const styles = {}
  let dest = options.output
  let hasChanged = false
  let prevIds = []

  return {
    name: 'css',
    buildStart() {
      hasChanged = false
    },
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
        hasChanged = true
      }

      // return a list of imports
      return imports.map((d) => `import ${d}`).join('\n');
    },
    generateBundle(opts, bundle) {
      const ids = []

      // Determine import order of files
      for (const file in bundle) {
        const root = bundle[file].facadeModuleId
        const modules = getCSSModules(root, filter, this.getModuleInfo)
        ids.push(...modules)
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

function arraysEqual(a, b) {
  if (a.length !== b.length) return false
  return a.every((ai, i) => ai === b[i]);
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

// Get all CSS modules in the order that they were imported
function getCSSModules(id, filter, getModuleInfo) {
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
};
