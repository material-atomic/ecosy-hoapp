---
name: hoapp-init-domain-app
description: Skill to initialize and define Domain Apps (Child Routers/Sub-Modules) within the @ecosy/hoapp framework. Call this skill when asked to add a new API module to the project (e.g. users, products, etc.).
---

# Initialize Domain App (@ecosy/hoapp)

<instructions>
  <rule>
    <title>Initialize Domain Router</title>
    <details>
      It is mandatory to use the base class `new Router(options)` instead of `new Hono()`. This Router instance will represent a specific Domain (e.g. `/users`, `/articles`).
      You can independently customize `logger` or `cors` for this Child Router if needed, as the Router class is fully compatible with the `RouterOptions` structure.
    </details>
  </rule>
  <rule>
    <title>Design-First API (DIP Pattern)</title>
    <details>
      Strictly DO NOT write APIs in the basic Hono format (e.g., `app.get("/path", (c) => ...)`). 
      Before writing Logic, you MUST initialize a `Descriptor` object so the Framework can automatically extract OpenAPI/Swagger code.
      - **Standard Descriptor declaration**: Use `Descriptor({ summary: "Description", tags: ["Users"], url: "/:id" })` by passing static configurations rather than calling builder methods.
      - **Usage with middleware (Optimal)**: Quick initialization via `createDescriptor(async (c,n) => ...).refine({ summary: ... })` helps compress logic routing design.
    </details>
  </rule>
  <rule>
    <title>Standardize Response Payload</title>
    <details>
      All successful branching APIs must package data inside the `new HttpResult(data).json(ctx)` object wrapper. This ensures the Data Response always features a consistent Schema `{ success, data... }`.
      Throw Validation / Business logic errors using the built-in Error Objects provided by the framework (e.g., `new NotFound()`, `new InternalServerError()`). Never use a bare `throw new Error()` or return `ctx.json({ error: ... })` directly.
    </details>
  </rule>
</instructions>

<examples>
  <example>
    <description>Standard source code for Domain Module API initialization</description>
    <reference_path>./examples/index.ts</reference_path>
  </example>
</examples>
