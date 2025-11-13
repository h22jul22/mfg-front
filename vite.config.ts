import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// declare module "@remix-run/node" {
//   interface Future {
//     v3_singleFetch: true;
//   }
// }

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: false,
        unstable_optimizeDeps: true,
      },
    }),
    tsconfigPaths(),
  ],
  server: {
    host: '0.0.0.0', // 모든 네트워크 인터페이스 허용 → 다른 PC에서 접근 가능하게
    port: 5173, // 기본 포트 또는 별도로 지정
    proxy: {
      '/api': {
        target: 'http://172.30.1.74:9001', // 백엔드 PC
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // ↓ Origin/Referer를 타겟으로 덮어씌워 CSRF/CORS 회피
        headers: {
          origin: 'http://172.30.1.74:9001',
          referer: 'http://172.30.1.74:9001/',
        },
      },
    },
  },
});
