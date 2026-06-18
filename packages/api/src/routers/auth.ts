import { publicProcedure, router } from "../index";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { auth } from "@x-workflow/auth";
import { env } from "@x-workflow/env/server";
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
      const newUser = await auth.api.signUpEmail({
        body: {
          email: input.email,
          password: input.password,
          name: input.name,
        },
      });

      return { success: true, user: newUser };
    }),

  // 忘记密码 - 发送重置邮件
  // Better-Auth 的 requestPasswordReset 内部已实现防邮箱枚举（无论邮箱是否存在都返回同一响应，
  // 且对不存在的邮箱模拟等量耗时操作以防计时攻击），因此这里不再额外查库判断邮箱是否存在，
  // 避免重复逻辑削弱其内置的防计时攻击效果。
  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      await auth.api.requestPasswordReset({
        body: {
          email: input.email,
          redirectTo: `${env.CORS_ORIGIN}/reset-password`,
        },
      });

      return {
        success: true,
        message: "If this email exists in our system, check your email for the reset link",
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
    .mutation(async ({ input }) => {
      try {
        await auth.api.resetPassword({
          body: {
            token: input.token,
            newPassword: input.password,
          },
        });
      } catch {
        // 不区分 token 不存在/已过期/已使用等具体原因，统一返回通用错误
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset link",
        });
      }

      return { success: true };
    }),
});
