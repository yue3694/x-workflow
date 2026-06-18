import { publicProcedure, router } from "../index";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { auth } from "@x-workflow/auth";
import { eq } from "drizzle-orm";
import { createDb } from "@x-workflow/db";
import { user } from "@x-workflow/db/schema/auth";

export const authRouter = router({
  // 用户注册
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = createDb();

      // 检查邮箱是否已存在
      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, input.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered",
        });
      }

      // 创建用户
      const newUser = await auth.api.signUp({
        body: {
          email: input.email,
          password: input.password,
          name: input.name,
        },
      });

      return { success: true, user: newUser };
    }),

  // 忘记密码 - 发送重置邮件
  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = createDb();

      // 检查邮箱是否存在
      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, input.email))
        .limit(1);

      if (existingUser.length === 0) {
        // 为安全起见，无论是否存在都返回成功
        return { success: true, message: "If the email exists, a reset link has been sent" };
      }

      // TODO: 发送重置邮件（需要配置邮件服务）
      // 目前简化处理，返回成功信息
      return {
        success: true,
        message: "Password reset instructions sent to email",
      };
    }),

  // 重置密码
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().min(8),
      })
    )
    .mutation(async () => {
      // TODO: 实现 token 验证和新密码设置
      // 需要配置邮件服务后实现
      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: "Password reset requires email configuration",
      });
    }),
});
