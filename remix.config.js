/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  appDirectory: 'app',
  assetsBuildDirectory: 'build/client/assets',
  publicPath: '/assets/',
  serverBuildPath: 'build/server/index.js',
  serverModuleFormat: 'esm', // Node 버전에 따라 "cjs" 가능
  // 정적 파일 처리 설정
  ignoredRouteFiles: ['**/.*'],
};
