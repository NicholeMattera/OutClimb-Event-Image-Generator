import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'

export default defineConfig({
    build: {
        copyPublicDir: true,
        emptyOutDir: true
    },
    plugins: [
        createHtmlPlugin({
            minify: true,
            entry: 'src/main.js',
            template: 'index.html'
        })
    ],
    publicDir: 'public'
})
