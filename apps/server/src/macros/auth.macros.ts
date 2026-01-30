import { auth } from "@zol-track/auth";
import Elysia from "elysia";

export const betterAuthMacro = new Elysia().macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({
        headers,
      });
      // console.log("session", session);
      
      if (!session) return status(401, { message: "Unauthorized" });
      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});
