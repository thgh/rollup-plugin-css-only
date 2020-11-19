import buble from '@rollup/plugin-buble'

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      exports: 'default'
    },
    {
      file: 'dist/index.es.js',
      format: 'es'
    }
  ],
  external: ['@rollup/pluginutils', 'fs-extra/lib/output'],
  plugins: [buble()]
}
