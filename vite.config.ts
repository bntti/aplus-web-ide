import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            '/grader': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                rewrite: (path) => {
                    return path.replace(/^\/grader/, '');
                },
            },
        },
    },
});
