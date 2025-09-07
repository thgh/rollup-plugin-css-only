import css from '../../src/index.mjs'

export default {
  input: { app: 'input.js' },
  output: {
    assetFileNames: '[name]_[hash:6][extname]',
    dir: 'output',
    entryFileNames: '[name]_[hash:6].js',
    format: 'esm',
    // hashCharacters: 'hex', // TODO should be added at rollup@4.10.0 or above 
  },
  plugins: [css()]
}
