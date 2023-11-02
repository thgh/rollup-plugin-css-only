export default {
  input: 'src/index.mjs',
  output: [
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      exports: 'default'
    },
    {
      file: 'dist/index.mjs',
      format: 'es'
    }
  ],
  external: ['@rollup/pluginutils', 'fs-extra/lib/output'],
}
