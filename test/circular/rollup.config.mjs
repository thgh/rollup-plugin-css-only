import css from 'rollup-plugin-css-only'

export default {
  input: 'a.js',
  output: {
    file: 'output/output.js',
    format: 'esm'
  },
  plugins: [css({ output: 'output.css' })]
}
