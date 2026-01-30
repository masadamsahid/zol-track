import { cors } from "@elysiajs/cors";
import openapi from "@elysiajs/openapi";
import { auth } from "@zol-track/auth";
import { env } from "@zol-track/env/server";
import { Elysia } from "elysia";
import { httpExceptionPlugin } from "elysia-http-exception";
import companiesRoutes from "./modules/companies";

const app = new Elysia();

app
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .use(openapi())
  .use(httpExceptionPlugin())
  .all("/api/auth/*", async (context) => {
    const { request, status } = context;
    if (["POST", "GET"].includes(request.method)) {
      return auth.handler(request);
    }
    return status(405);
  }, {
    detail: {
      summary: "Better Auth Endpoints",
      tags: ["Better Auth"],
    },
  })
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });
        if (!session) return status(401);
        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  })
  .get("/", (c) => {
    console.log(c.user); // testing auth macro
    return "OK"
  }, { auth: true })
  .group("/api", (app) => {
    return app
      .use(companiesRoutes);
  });


app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
