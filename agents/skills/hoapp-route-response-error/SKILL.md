---
name: hoapp-route-response-error
description: In-depth guide on Exception Handling and Throwing Exception standards back to the Client within @ecosy/hoapp router branches.
---

# Error & Exception Management (@ecosy/hoapp)

<instructions>
  <rule>
    <title>Throwing Exceptions Rule</title>
    <details>
      Strictly DO NOT return manual error results using convoluted statements like `return ctx.json({ status: "error", msg: "Error" }, 400)`. The framework dictates a Global Error Handler that wraps all Routers. Thus, the sole methodology to report an error from a Controller/Handler is to **"Throw"** the pre-supplied Exception Classes.
    </details>
  </rule>

  <rule>
    <title>Utilizing Built-in Error Classes</title>
    <details>
      Always import and utilize standard Error Objects from `@ecosy/hoapp`. They intrinsically bind the correct HTTP Status codes:
      - `BadRequest` (400): Client sent an invalid format or violated validation rules.
      - `Unauthorized` (401): Not authenticated, or Token expired.
      - `Forbidden` (403): User is logged in but lacks the permissions for the operation.
      - `NotFound` (404): Database resource is missing or ID does not exist.
      - `Conflict` (409): Data duplication (e.g., User registers with an existing email).
      - `InternalServerError` (500): Originating from Backend errors, DB disconnects, etc.
    </details>
  </rule>

  <rule>
    <title>Leveraging HttpResult (Traces masking constraint)</title>
    <details>
      When an Error is thrown, the Global Handler of `@ecosy/hoapp` catches it and implicitly packages it into the `HttpResult` format. The result served to the End-user strictly matches the standard JSON scheme: `{ success: false, message: "...", error: ... }`. It automatically masks stack traces when running in Production environments. Utilizing the standard Javascript `throw new Error()` is strictly forbidden contextually.
    </details>
  </rule>
</instructions>

<examples>
  <example>
    <description>Example calling Controller Exception Throws for common error variants</description>
    <reference_path>./examples/index.ts</reference_path>
  </example>
</examples>
