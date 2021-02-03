import css from '../../src/index.js'

export default {
  input: 'input.js',
  output: {
    file: 'output/bundle.js',
    format: 'esm'
  },
  plugins: [
    css({ output: 'bundle.css' })
  ]
}