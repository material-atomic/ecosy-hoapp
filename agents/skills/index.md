---
name: ecosy-hoapp-architecture
description: All programming operations, API design, Router, or Middleware configurations using the `@ecosy/hoapp` framework must strictly adhere to the patterns in this skill file.
---

# Ecosy HoApp Architecture

This document guides how to develop and scale backend services based on the `@ecosy/hoapp` architecture.

<instructions>
  <rule>
    <title>Routing Architecture (Nested Routes Design)</title>
    <details>
      The `@ecosy/hoapp` architecture clearly separates the **Root App** from **Child Routers**. 
      - Absolutely do not use `app.route()` arbitrarily.
      - Use the `Router.create()` module for the Root App (See `hoapp-init-root-app`).
      - Use `new Router()` for Sub-Routers (See `hoapp-init-domain-app`).
      - Authenticate JWT/Bearer at `src/auth.ts` (See `hoapp-auth`).
      - Wrap Middlewares with API (See `hoapp-create-descriptor`).
    </details>
  </rule>

  <rule>
    <title>Declarative Middlewares Pattern</title>
    <details>
      Strictly avoid writing Imperative logic by manually calling `app.use()` scattered throughout the codebase.
      - **Preferred Approach (Optimal)**: Define them in the `middlewares` array by directly passing Descriptor objects. Framework middlewares like `json` or `cors` are already compatible with this Descriptor Array.
      - **Legacy Approach**: The `useFactory` property takes an array of `{ path, use }`. This still works but is not recommended for new code.
    </details>
  </rule>

  <rule>
    <title>Swagger & zValidator Descriptor Driven (DIP)</title>
    <details>
      All API Route Endpoints within a Child Router **must be declared via a `Descriptor` configuration**, absolutely do not write raw Hono APIs so the system can auto-generate DIP documentation (Swagger/OpenAPI).
      - **Using Configuration**: Static configuration parameters via class: `Descriptor({ summary: "Description", tags: ["Tag"] })`. A common mistake in older agents is trying to call `new Descriptor().summary()` - this is Invalid syntax.
      - Integrate cleanly with `@hono/zod-validator` to validate schemas via body/request/response configurations of the Descriptor.
    </details>
  </rule>

  <rule>
    <title>Error & Result Standardization</title>
    <details>
      - The Request Lifecycle must Return Responses via the `HttpResult` wrapper to ensure JSON output always has the standard format `{ success, data, message, error_details }`.
      - Error throwing workflow: Instead of `throw new Error()`, Throw the hierarchical HTTP formats like `new NotFound("...")` or `new InternalServerError("...")` defined in `@ecosy/hoapp/result`.
    </details>
  </rule>
</instructions>

<examples>
  <example>
    <description>Standard Root File index.ts template for initializing hoapp and mounting Child Routers</description>
    <code>
import { Router, json, cors } from "@ecosy/hoapp";
import { Swagger } from "@ecosy/hoapp/swagger-ui";
import usersModule from "./router/users"; // This is an instance of new Router()

const swagger = new Swagger({
  base: "/docs",
  info: { title: "API", version: "1.0.0" }
});

const app = Router.create({
  base: "/",
  logger: "/api/*",
  middlewares: [
    // Optimal Approach: Direct Middleware Descriptor
    cors({ origins: ["http://localhost:3000"] }).url("/api/*"),
    json.url("/v1/*")
  ],
  useFactory: [
    // Legacy Approach (Backward Compatibility Support)
    {
      path: "/v2/*",
      use: [json.forRoute()]
    }
  ],
});

// Mounted Child Router
Router.add(app, usersModule, swagger.getRouter());

export default app;
    </code>
  </example>

  <example>
    <description>Standard code for creating Sub-Router via Descriptor DIP pattern</description>
    <code>
import { Router, HttpResult, NotFound } from "@ecosy/hoapp";
import { Descriptor } from "@ecosy/hoapp/descriptor";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const usersModule = new Router("/users"); // Initialize Sub-Router

const getProfileDesc = Descriptor({
  url: "/:id",
  tags: ["Users"],
  summary: "Get User Profile",
  responses: { 200: { description: "Success" } }
});

usersModule.get(getProfileDesc, async (ctx) => {
  const id = ctx.req.param("id");
  if (!id) throw new NotFound("Missing ID");
  return new HttpResult({ id, name: "Admin" }).json(ctx);
});

export default usersModule;
    </code>
  </example>
</examples>
