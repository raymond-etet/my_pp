import jwt from "jsonwebtoken";
import prisma from "~/server/utils/prisma";

// 注意：密钥需要与登录时使用的密钥完全一致
// TODO: 应该从 .env 环境变量中读取
const JWT_SECRET = "your-super-secret-key-that-should-be-in-env-file";

// 定义一个类型来扩展 H3EventContext
// 这样我们就可以在 event.context 上安全地使用 user 属性
// 并获得 TypeScript 的类型提示
declare module "h3" {
  interface H3EventContext {
    user?: {
      userId: number;
      username: string;
    };
  }
}

export default defineEventHandler(async (event) => {
  // 定义不需要认证的公开路由
  const publicRoutes = ["/api/auth/login", "/api/auth/register"];

  const path = getRequestPath(event);

  // 如果当前请求的路径是公开路由，则直接跳过认证
  if (publicRoutes.includes(path)) {
    return;
  }

  // 只保护 /api/ 下的路由 (排除公开路由)
  if (!path.startsWith("/api/")) {
    return;
  }

  // 从请求头获取 Authorization
  const authHeader = getHeader(event, "Authorization");

  // 如果没有提供 Authorization 头，或者格式不正确，则不进行处理
  // 具体的接口可以根据 event.context.user 是否存在来决定如何响应
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return;
  }

  const token = authHeader.substring(7); // 提取 "Bearer " 后面的 token 部分

  try {
    // 验证 JWT
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      username: string;
    };

    // 可以在这里额外查询数据库确认用户是否仍然有效（可选，但更安全）
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true }, // 只选择需要的字段
    });

    if (user) {
      // 将解码后的用户信息挂载到请求上下文中
      event.context.user = {
        userId: user.id,
        username: user.username,
      };
    }
  } catch (error) {
    // 如果 token 验证失败（例如过期、签名无效），不做任何处理
    // event.context.user 将保持 undefined
    // 各个接口可以自行决定如何处理未认证的用户
    // console.error('JWT Verification Error:', error.message);
  }
});
