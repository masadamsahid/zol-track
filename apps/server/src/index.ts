import { cors } from "@elysiajs/cors";
import openapi from "@elysiajs/openapi";
import { auth } from "@zol-track/auth";
import { env } from "@zol-track/env/server";
import { Elysia } from "elysia";
import { httpExceptionPlugin } from "elysia-http-exception";
import companiesRoutes from "./modules/companies";
import { betterAuthMacro } from "./macros/auth.macros";

const app = new Elysia();

app
  .use(
    cors({
      origin:env.CORS_ORIGIN,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .use(openapi({
    documentation: {
      security: [{ betterAuth: [] }],
      components: {
        securitySchemes: {
          betterAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'better-auth.session_token',
          },
        }
      }
    }
  }))
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
  .use(betterAuthMacro)
  .get("/", (c) => {
    console.log(c.user); // testing auth macro
    return "OK"
  }, { auth: true })
  .get("/health", () => "Server is healthy ")
  .group("/api", (app) => {
    return app
      .use(companiesRoutes);
  });


app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
