# Bazi Paipan H5 App

基于 Vue3 + Nuxt3 + Prisma 的八字排盘应用。

## 开发日志

### 2025-08-18

- **feat**: 初始化项目结构，包含 Nuxt3, Prisma, UnoCSS。
- **feat**: 完成首页表单和结果页的基础布局。
- **feat**: 实现核心排盘 API `/api/pai-pan`，包含参数校验和数据库存储。
- **feat**: 实现历史记录查询 API `/api/pai-pan/history`。
- **fix**: 修复了 Nuxt3 中使用 Prisma Client 时的 ESM/CJS 模块兼容性问题。通过 `import pkg from '@prisma/client'; const { PrismaClient } = pkg;` 解决了 `Named export 'PrismaClient' not found` 的错误。
- **fix**: 解决了由于 Vite 缓存或残留进程导致的应用启动失败问题。通过添加 `kill-port` 依赖和 `dev:force` 脚本 (`npx kill-port 3000 && nuxt dev`) 来确保每次启动前都清理端口，保证了开发环境的稳定性。
