# Rollup plugin that bundles imported css

<a href="LICENSE">
  <img src="https://img.shields.io/badge/license-MIT-brightgreen.svg" alt="Software License" />
</a>
<a href="https://github.com/thgh/rollup-plugin-css-only/issues">
  <img src="https://img.shields.io/github/issues/thgh/rollup-plugin-css-only.svg" alt="Issues" />
</a>
<a href="http://standardjs.com/">
  <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg" alt="JavaScript Style Guide" />
</a>
<a href="https://npmjs.org/package/rollup-plugin-css-only">
  <img src="https://img.shields.io/npm/v/rollup-plugin-css-only.svg?style=flat-squar" alt="NPM" />
</a>
<a href="https://github.com/thgh/rollup-plugin-css-only/releases">
  <img src="https://img.shields.io/github/release/thgh/rollup-plugin-css-only.svg" alt="Latest Version" />
</a>

## Features

- CSS is emitted as 1 asset
- Order of imports is guaranteed
- Watches CSS imports
- Typescript types

## Installation

```
# v4 is compatible with Rollup 3 & 2
npm install --save-dev rollup-plugin-css-only
```

## Usage

```js
// rollup.config.js
import css from 'rollup-plugin-css-only'

export default {
  input: 'input.js',
  output: {
    file: 'output.js',
    format: 'es',
    assetFileNames: 'assets/[name]-[hash][extname]'
  },
  plugins: [css()]
}
```

```js
// entry.js
import './reset.css'
import './layout.css'
```

```css
/* layout.css */
@import './nested.css';
@import './more.css';
```

### Options

There is 1 option: `output`.  
By default the plugin will use `output.assetFileNames` to decide the filename.

```js
css({
  // Optional: filename to write all styles to
  output: 'bundle.css'
})
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Contributing

Contributions and feedback are very welcome.

To get it running:

1. Clone the project.
2. `npm install`
3. `npm run build`

## Credits

- [Thomas Ghysels](https://github.com/thgh)
- [All Contributors][link-contributors]

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

[link-author]: https://github.com/thgh
[link-contributors]: ../../contributors
[rollup-plugin-vue]: https://www.npmjs.com/package/rollup-plugin-vue
[rollup-plugin-buble]: https://www.npmjs.com/package/rollup-plugin-buble
[rollup-plugin-babel]: https://www.npmjs.com/package/rollup-plugin-babel
[vue-template-compiler]: https://www.npmjs.com/package/vue-template-compiler
