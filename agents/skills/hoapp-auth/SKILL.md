---
name: hoapp-auth
description: Skill for implementing Authentication mechanisms (JWT, Bearer, Basic) in the @ecosy/hoapp framework. Call this skill when asked to protect an Endpoint or Sub-Router requiring logged-in sessions.
---

# Authentication with @ecosy/hoapp/auth

<instructions>
  <rule>
    <title>Utilize Built-in Auth Middleware</title>
    <details>
      The framework provides 3 primary authentication protocols natively through `src/auth.ts`:
      - `jwt(options)`: Authentication via standard JSON Web Token encryption.
      - `bearer(options)`: Static token Authentication.
      - `basic(options)`: Basic Authentication (Username:Password).
      All of these functions strictly return a `DescriptorLike` object generated natively from Hono cores.
    </details>
  </rule>
  <rule>
    <title>Mount Auth into Endpoints or Routers</title>
      - **Global Protection**: You can configure it globally by throwing the auth descriptor initialization directly into the `middlewares` array at the Root App level and restricting its scope via `.url("/protected/*")`. Example: `jwt({ secret: '...' }).url('/protected/*')`.
      - **Direct Endpoint Mapping**: Apply an auth component directly as the root configuration of an endpoint by chaining `.refine()` to set URL constraints. E.g. `const myDesc = jwt({ secret: '...' }).refine({ url: '/profile', summary: '...' })`.
      - **Middleware Chains**: Append it utilizing native `.use()` configurations within predefined descriptor definitions. `const myDesc = Descriptor({ url: '/profile' }).use(jwt({ secret: '...' }))`.
    </details>
  </rule>
</instructions>

<examples>
  <example>
    <description>Standard source code configuring JWT Auth for Endpoints (Chained Configuration Style)</description>
    <reference_path>./examples/index.ts</reference_path>
  </example>
</examples>
