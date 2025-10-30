# VR 装修试装系统 - 增强 Demo（前端 + 后端）

包含：
- 前端：React + Three.js，支持上传材质、家具 GLTF 加载、快照导出、WebXR 入口
- 后端：Node.js (Express) 示例，用于保存上传文件和场景配置（短链接）

运行步骤：

1) 前端
- 进入项目根目录
- 安装依赖并启动（使用 Vite）
  npm install
  npm run dev

2) 后端（本地演示）
- 进入 server 目录
  cd server
  npm install
  npm start
- 后端默认监听 4000，前端通过相对路径 /api/* 调用（在本地开发时请使用代理或在前端开发服务器配置 proxy 指向 http://localhost:4000）

说明：
- 上传文件会存储在 server/uploads，并通过 /uploads/<file> 对外访问（仅 demo）
- 保存场景会返回一个短链接 /s/:id，打开会返回场景 JSON
- WebXR 入口使用 three.js 的 XRButton（你的浏览器需支持 WebXR，并在 HTTPS 或 localhost 下）
- GLTF 模型示例使用 threejs.org 的演示模型，真实环境请把模型放到 CDN 并确保 CORS 可访问
