import { createFilter } from 'rollup-pluginutils'
import { outputFile } from 'fs-extra'

export default function css(options = {}) {
  const filter = createFilter(options.include || ['**/*.css'], options.exclude)
  const styles = {}
  let dest = options.output
  let changes = 0

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
      if (styles[id] !== code && (styles[id] || code)) {
        styles[id] = code
        changes++
      }

      return ''
    },
    generateBundle(opts, bundle) {
      // No stylesheet needed
      if (!changes || options.output === false) {
        return
      }
      changes = 0

      // Combine all stylesheets
      let css = ''
      for (const id in styles) {
        css += styles[id] || ''
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
      return new Promise((resolve, reject) => {
          outputFile(dest, css, err => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
      })
    }
  }
}
