import { nodeResolve } from "@rollup/plugin-node-resolve"
import { terser } from 'rollup-plugin-terser';


export default {
  input: "./editor.js",
  output: {
    file: "./public/js/editor.js",
    format: "iife",
  },
  plugins: [nodeResolve(), terser()]
}