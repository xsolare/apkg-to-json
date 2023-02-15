import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import externals from 'rollup-plugin-node-externals';
import json from '@rollup/plugin-json';
import analyze from 'rollup-plugin-analyzer';
import fs from 'fs';
import path from 'path';

const lib = JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf8'));
const year = new Date().getFullYear();
const banner = `// xSolare v${lib.version} Copyright (c) ${year} ${lib.author} and contributors`;

const config = defineConfig([
  //* CJS config
  {
    input: ['./src/index.ts'],
    output: {
      dir: 'dist',
      format: 'cjs',
      sourcemap: false,
      banner
    },
    plugins: [
      json(),
      commonjs(),
      externals({ peerDeps: true }),
      typescript({
        declarationDir: 'dist/types',
        sourceMap: false,
        tsconfig: 'tsconfig.build.json'
      }),
      terser(),
      analyze()
    ]
  },
  //* ESM config
  {
    input: ['./src/index.ts'],
    output: {
      dir: 'dist/esm',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src',
      sourcemap: false
    },
    plugins: [
      json(),
      commonjs(),
      externals({ peerDeps: true }),
      typescript({ outDir: 'dist/esm', declaration: false, sourceMap: false }),
      terser(),
      analyze()
    ]
  },
  //* UMD  config
  {
    input: ['./src/index.ts'],
    output: {
      dir: 'dist/umd',
      format: 'iife',
      inlineDynamicImports: true,
      sourcemap: false
    },
    plugins: [
      json(),
      commonjs(),
      externals({ peerDeps: true }),
      typescript({ outDir: 'dist/umd', declaration: false, sourceMap: false }),
      terser(),
      analyze()
    ]
  }
]);

export default config;
