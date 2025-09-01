import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        allowedHosts: ['test.puiying.cn', 'host.docker.internal'],
        proxy: {
          '/.well-known': {
            changeOrigin: true,
            target: 'http://localhost:5195/',
            ws: true,
          },
          '/rapi2': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/rapi2/, ''),
            // mock代理目标地址
            target: 'http://localhost:5320/api',
            ws: true,
          },
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            target: 'http://localhost:5195/api',
            ws: true,
          },
          '/cas': {
            changeOrigin: true,
            target: 'http://localhost:5195/',
            ws: true,
          },
        },
      },
    },
  };
});
