---
name: hoapp-middleware
description: Skill to initialize, configure, and use Declarative Middlewares (json, cors, auth) using the Descriptor architecture within the @ecosy/hoapp framework. Call this skill when requested to secure routes, append CORS, or parse JSON bodies.
---

# Middlewares and Descriptor (@ecosy/hoapp)

<instructions>
  <rule>
    <title>Using Built-in Middleware</title>
    <details>
      Native middlewares like `json`, `cors`, or `jwt`, `basic`, `bearer` (from `src/auth.ts`) are all pre-built `Descriptor` objects provided by the system. You MUST NOT call `app.use()` in Hono to wrap them.
      - **Global Scope**: Push the Middleware Descriptor object directly into the `middlewares: []` configuration of the Root App.
      - **Route Scope**: Because they are Descriptors themselves, to attach them to a specific Route's logic chain, you must extract their core handlers using spread syntax and `.forRoute()`: `.use(...json.forRoute())`.
    </details>
  </rule>
  <rule>
    <title>Scope Chaining with .url() and Notes on .refine()</title>
    <details>
      Any Descriptor Middleware can have a bounded Scope application.
      - Use `.url("/v1/*")` to limit the path of application (e.g., `json.url('/api/*')`).
      - **CRITICAL PERFORMANCE REMINDER**: We HIGHLY DISCOURAGE using the `.refine()` function to attach Metadata (like `summary`, `tags`) to middleware. The reason is that middleware Metadata has NO EFFECT on Swagger/OpenAPI documentation generation (Swagger only scrapes the final endpoint). Furthermore, calling `.refine()` forces the system to generate a new Class definition, pointlessly dropping memory and impacting performance.
    </details>
  </rule>
  <rule>
    <title>Create Custom Wrappers with createDescriptor()</title>
    <details>
      If you have a native Hono Middleware, use the `createDescriptor(...handlers)` function to package it into a `Descriptor` format that complies with the Ecosy architecture.
      Example:
      ```typescript
      const myDescriptor = createDescriptor(async (c, n) => {
        // ... logic
        await n();
      }).refine({ summary: "My Wrapper" });
      ```
    </details>
  </rule>
</instructions>

<examples>
  <example>
    <description>Standard source code for creating Middleware Descriptors and Metadata Caching</description>
    <reference_path>./examples/index.ts</reference_path>
  </example>
</examples>
