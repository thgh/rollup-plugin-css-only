import buble from 'rollup-plugin-buble'

export default {
  input: 'src/index.js',
  dest: 'dist/index.cjs.js',
  plugins: [
    buble()
  ],
  // Cleaner console
  onwarn (msg) {
    if (msg && msg.message.startsWith('Treating')) {
      return
    }
  }
}
