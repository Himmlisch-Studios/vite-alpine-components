import typescript from '@rollup/plugin-typescript'

export default {
    input: 'src/index.ts',
    external: ['tinyglobby', 'node-html-parser', 'node:path', 'node:fs'],
    output: [
        {
            dir: './dist',
            entryFileNames: '[name].js',
            format: 'esm',
            sourcemap: true,
        }
    ],
    plugins: [
        typescript({ declaration: true, outDir: './dist' })
    ]
}