import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "~/server/utils/prisma";

// TODO: JWT 密钥应该存储在 .env 文件中，而不是硬编码
const JWT_SECRET = "your-super-secret-key-that-should-be-in-env-file";

export default defineEventHandler(async (event) => {
  try {
    // 1. 读取请求体
    const body = await readBody(event);
    const { username, password } = body;

    // 2. 输入验证
    if (!username || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: "用户名和密码不能为空",
      });
    }

    // 3. 查询用户
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw createError({
        statusCode: 401, // Unauthorized
        statusMessage: "用户名或密码错误",
      });
    }

    // 4. 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401, // Unauthorized
        statusMessage: "用户名或密码错误",
      });
    }

    // 5. 生成 JWT
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: "7d" } // Token 有效期为 7 天
    );

    // 6. 返回 Token
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    console.error("登录失败:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误，登录失败",
    });
  }
});
