---
name: hoapp-init-root-app
description: Skill for initializing the Root Application using Router.create in the @ecosy/hoapp library. Call this skill when requested to initialize or configure the main execution file (entrypoint) of the Backend.
---

# Initialize Root App (@ecosy/hoapp)

<instructions>
  <rule>
    <title>Initialize Entrypoint</title>
    <details>
      It is mandatory to use the static method `Router.create(options)` in the main execution file (usually `index.ts`). This function initializes a pure `Hono` instance containing necessary default configurations. Absolutely do not initialize using `new Hono()`.
    </details>
  </rule>
  <rule>
    <title>Use Declarative Middleware</title>
    <details>
      Non-logic or outer wrapper processing flows must be defined as Declarative Configs inside the `Router.create()` parameters.
      - **[Optimal] - Declare in middlewares**: Use the `middlewares: [...]` structure to insert middleware Descriptor objects. Example: `middlewares: [json.url("/v1/*"), cors({ url: "/api/*" })]`. This is the library's modern architecture standard.
      - **[Legacy] - Declare in useFactory**: Use `useFactory: [{ path, use }]`. This requires passing raw MiddlewareHandler functions. New code should avoid this.
    </details>
  </rule>
  <rule>
    <title>Mounting Modules</title>
    <details>
      After creating the root `app`, always use the utility `Router.add(app, ...childrenRouter)` to mount Child Routers into the Root App.
    </details>
  </rule>
</instructions>

<examples>
  <example>
    <description>Standard source code for Root Application initialization</description>
    <reference_path>./examples/index.ts</reference_path>
  </example>
</examples>
