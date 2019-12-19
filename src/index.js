import { promises, writeFile } from 'fs'
import { createFilter } from 'rollup-pluginutils'
import path from 'path'

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
    generateBundle(opts) {
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
        options.output(css, styles)
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
        let { dir } = path.parse(dest)

        promises
          .mkdir(dir, { recursive: true })
          .then(() => {
            writeFile(dest, css, err => {
              if (err) {
                reject(err)
              } else {
                resolve()
              }
            })
          })
          .catch(err => {
            reject(err)
          })
      })
    }
  }
}
