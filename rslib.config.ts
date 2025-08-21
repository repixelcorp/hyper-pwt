import { defineConfig } from "@rslib/core";

export default defineConfig({
  lib: [
    {
      format: 'cjs',
      bundle: true
    }
  ],
  source: {
    entry: {
      index: 'src/cli.ts'
    }
  },
  output: {
    minify: {
      js: true,
      jsOptions: {
        minimizerOptions: {
          mangle: true,
          minify: true,
          compress: {
            defaults: true,
            unused: true,
            dead_code: true,
            toplevel: true
          }
        }
      }
    }
  }
});