// Type definitions for rollup-plugin-css-only 3.1
// Project: https://github.com/thgh/rollup-plugin-css-only
// Definitions by: Mateusz Szewc <https://github.com/SitamMatt>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="node" />
import { Plugin, OutputBundle } from 'rollup'

declare namespace css {
  interface Options {
    /**
     *  All CSS files will be parsed by default, but you can also specifically include files
     */
    include?: ReadonlyArray<string | RegExp> | string | RegExp | null
    /**
     *  CSS files to exclude from being parsed
     */
    exclude?: ReadonlyArray<string | RegExp> | string | RegExp | null
    /**
     * If a name is supplied, this will be used as substitution for [name]
     * in the corresponding output.chunkFileNames or output.assetFileNames pattern,
     * possibly adding a unique number to the end of the file name to avoid conflicts.
     * If neither a name nor fileName is supplied, a default name will be used.
     *
     * @link https://rollupjs.org/guide/en/#thisemitfile
     */
    name?: string
    /**
     * If a fileName is provided, it will be used unmodified as the name of the generated file,
     * throwing an error if this causes a conflict.
     * If neither a name nor fileName is supplied, a default name will be used.
     *
     * @link https://rollupjs.org/guide/en/#thisemitfile
     */
    fileName?: string
    /**
     * Callback that will be called ongenerate
     *
     * When set to a string, it will be used as `fileName`.
     */
    output?:
      | boolean
      /** @deprecated Use name or fileName instead */
      | string
      | ((
          styles: string,
          styleNodes: Record<string, string>,
          bundle: OutputBundle
        ) => void)
      | null
      | undefined
  }
}

declare function css(options?: css.Options): Plugin
export = css
