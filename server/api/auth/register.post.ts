import bcrypt from "bcrypt";
import prisma from "~/server/utils/prisma";

const SALT_ROUNDS = 10; // 密码加盐轮数

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

    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: "密码长度不能少于6位",
      });
    }

    // 3. 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw createError({
        statusCode: 409, // Conflict
        statusMessage: "该用户名已被注册",
      });
    }

    // 4. 密码加密
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 5. 创建新用户
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    // 6. 返回成功响应（不包含密码）
    // Nuxt3会自动处理JSON序列化
    // H3会自动设置Content-Type为application/json
    setResponseStatus(event, 201); // Created
    return {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
    };
  } catch (error: any) {
    // 错误处理
    // 如果是已知的 H3Error，直接抛出
    if (error.statusCode) {
      throw error;
    }

    console.error("注册失败:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误，注册失败",
    });
  }
});
