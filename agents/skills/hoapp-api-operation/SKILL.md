---
name: hoapp-api-operation
description: Skill to properly define advanced Swagger-compatible OpenAPI endpoints via the ApiOperation wrapper in the @ecosy/hoapp framework. Use this skill when you need fully typed Swagger configurations such as parameters, requestBody, and security.
---

# Defining Advanced OpenAPI Routes (@ecosy/hoapp)

<instructions>
  <rule>
    <title>Using ApiOperation instead of basic Descriptor</title>
    <details>
      For endpoints that require comprehensive Swagger schema details (e.g., path parameters, typed request bodies, or security overrides), use the `ApiOperation` wrapper from `@ecosy/hoapp/swagger`.
      - `ApiOperation` acts identically to the core `Descriptor` but provides a strongly typed API similar to NestJS Swagger decorators.
      - Never use basic `Descriptor` if you need to define explicit `parameters` or `requestBody`.
    </details>
  </rule>
  <rule>
    <title>ApiOperation Configuration Object Structure</title>
    <details>
      The configuration object supports full OpenAPI standard fields natively:
      - `url`, `title`, `description`, `summary`, `tags`
      - `operationId`: Unique identifier for the operation.
      - `parameters`: Array of explicit query, path, header, or cookie definitions.
      - `requestBody`: Explicit schema constraints for the payload.
      - `security`: Override global security requirements for this specific route.
      - `deprecated`: Mark the route as deprecated.
    </details>
  </rule>
</instructions>

<examples>
  <example>
    <description>Example of a comprehensive ApiOperation declaration for user creation</description>
    <code>
import { Router } from "@ecosy/hoapp";
import { ApiOperation } from "@ecosy/hoapp/swagger";
import { HttpResult } from "@ecosy/hoapp/result";

const usersModule = new Router("/users");

const createUserDesc = ApiOperation({
  url: "/",
  tags: ["Users"],
  title: "Create User",
  description: "Creates a new user record in the database",
  operationId: "createUser",
  parameters: [
    { name: "group", in: "query", required: false, description: "Group filter" }
  ],
  requestBody: {
    required: true,
    content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" } } } } }
  },
  responses: { 200: { description: "Success" } }
});

usersModule.post(createUserDesc, async (ctx) => {
  // Extract body and execute logic...
  return new HttpResult({ success: true }).json(ctx);
});

export default usersModule;
    </code>
  </example>
</examples>
