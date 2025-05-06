import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/.well-known': {
            changeOrigin: true,
            // rewrite: (path) => path.replace(/^\/rapi2/, ''),
            target: 'http://localhost:5195/',
            ws: true,
          },
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // mock代理目标地址
            target: 'http://localhost:5320/api',
            ws: true,
          },
          '/rapi2': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/rapi2/, ''),
            target: 'http://localhost:5195/api',
            ws: true,
          },
        },
      },
    },
  };
});
