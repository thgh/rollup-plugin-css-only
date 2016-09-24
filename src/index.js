import { writeFile } from 'fs'
import { createFilter } from 'rollup-pluginutils'

export default function css (options = {}) {
  const filter = createFilter(options.include || ['**/*.css'], options.exclude)
  const styles = {}
  let dest = options.output

  return {
    name: 'css',
    transform (code, id) {
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

      // Map of every stylesheet
      styles[id] = code

      return ''
    },
    ongenerate (opts, rendered) {
      // No stylesheet needed
      if (options.output === false) {
        return
      }

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
        dest = opts.dest || 'bundle.js'
        if (dest.endsWith('.js')) {
          dest = dest.slice(0, -3)
        }
        dest = dest + '.css'
      }

      // Emit styles to file
      writeFile(dest, css, (err) => {
        if (err) {
          throw err
        }
        emitted(dest, css.length)
      })
    }
  }
}
