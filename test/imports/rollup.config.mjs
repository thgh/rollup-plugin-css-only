import css from '../../src/index.mjs'

export default {
  input: 'input.js',
  output: {
    file: 'output/output.js',
    format: 'esm'
  },
  plugins: [
    css({ output: 'output.css' })
  ]
}