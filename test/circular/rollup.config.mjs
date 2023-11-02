import css from '../../src/index.mjs'

export default {
  input: 'a.js',
  output: {
    file: 'output/output.js',
    format: 'esm'
  },
  plugins: [css({ output: 'output.css' })]
}
