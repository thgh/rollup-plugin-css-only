import css from '../../src/index.mjs'

export default {
  input: 'main.js',
  output: {
    chunkFileNames: '[name].js',
    dir: 'output',
    format: 'esm'
  },
  plugins: [css({ output: 'output.css' })]
}
