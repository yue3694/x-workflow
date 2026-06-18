import { adminRouter } from "./admin";
import { authRouter } from "./auth";
import { protectedProcedure, publicProcedure, router } from "../index";
import { dashboardRouter } from "./dashboard";
import { debuggerRouter } from "./debugger";
import { knowledgeRouter } from "./knowledge";
import { workflowRouter } from "./workflow";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  auth: authRouter,
  admin: adminRouter,
  dashboard: dashboardRouter,
  debugger: debuggerRouter,
  knowledge: knowledgeRouter,
  workflow: workflowRouter,
});
export type AppRouter = typeof appRouter;
