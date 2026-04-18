---
name: hoapp-init-route
description: Skill to properly define a standalone API Route (e.g. GET, POST) in the @ecosy/hoapp framework via the Descriptor Pattern to guarantee validation schema alignment and automatic Swagger OpenAPI generation.
---

# Design-First API Route Mapping (@ecosy/hoapp)

<instructions>
  <rule>
    <title>Descriptor Object Configuration Rule</title>
    <details>
      Never define a Route directly via string path (e.g., `router.get('/', ...)`). All endpoints must be routed through a `Descriptor`.
      - **Configuration Object Structure**: Initialize using the syntax `Descriptor({ url: "/path", summary: "Desc", tags: ["Group"], responses: { 200: { description: "Success" } } })`. Legacy builder chain methods like `.url()` or `.summary()` are deprecated.
    </details>
  </rule>
  <rule>
    <title>Input Data Validation Integration (Zod)</title>
    <details>
      The framework perfectly integrates with the Zod library via the `@hono/zod-validator` adapter.
      - **Validators Integration**: To validate payloads or query variables, append the `.use()` function to the initialized Descriptor instance. Example: `Descriptor({...}).use(zValidator("json", YourSchema))`.
    </details>
  </rule>
  <rule>
    <title>Declaring Handlers with Validation Inference</title>
    <details>
      Register the endpoint into the Router by strictly passing the Descriptor instance to the HTTP method function (e.g. `router.get(getDesc, async (ctx) => ...)`).
      Inside the Callback body, TypeScript will Auto-Infer the correct type whenever calling `ctx.req.valid("json")` or `ctx.req.valid("query")` if the Descriptor is correctly wrapped with a Zod validator.
    </details>
  </rule>
  <rule>
    <title>Expected Return Payload</title>
    <details>
      It is strictly prohibited to return raw unstructured context responses. You must utilize the `.json(ctx)` method wrapped over `new HttpResult(YOUR_DATA)`. Data will automatically comply with the global response schema.
      In the event of logic interruptions or HTTP errors, strictly utilize `throw new NotFound("...")`, `throw new InternalServerError("...")` or related predefined classes. The static Hono error middleware catches all Exceptions systematically.
    </details>
  </rule>
</instructions>

<examples>
  <example>
    <description>Comprehensive Example of Route declarations resolving Query Params, Body Validation and Path Parameters via Configuration Descriptor Object</description>
    <reference_path>./examples/index.ts</reference_path>
  </example>
</examples>
