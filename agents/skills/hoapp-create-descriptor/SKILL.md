---
name: hoapp-create-descriptor
description: Skill to define Middleware Wrappers via the createDescriptor function inside the @ecosy/hoapp architecture. Call this skill when you need to package standard Hono middlewares into a structured Descriptor pattern.
---

# Wrapping Middlewares with createDescriptor (@ecosy/hoapp)

<instructions>
  <rule>
    <title>Transforming Hono Middleware into a Descriptor</title>
    <details>
      Any intermediary processing logic previously written as an inline function `(ctx, next) => {}` must be transformed into a Descriptor Object using the `createDescriptor()` factory.
      - Syntax: `createDescriptor(async (ctx, next) => { ... })`.
      - It guarantees that the middleware is 100% compatible with the API Root's static `.use()` method and `Router.create({ middlewares: [] })`.
      - This exact pattern is how the framework internally authors `src/auth.ts` or `src/json.v2.ts`.
    </details>
  </rule>
</instructions>

<examples>
  <example>
    <description>Sample reference for wrapping Custom Logic into a Descriptor</description>
    <reference_path>./examples/index.ts</reference_path>
  </example>
</examples>
