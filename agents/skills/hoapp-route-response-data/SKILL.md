---
name: hoapp-route-response-data
description: In-depth guide on how to format and wrap Return Data (Success Data) for the client using the HttpResult object to ensure a consistent JSON structure.
---

# Standardize Response Data

<instructions>
  <rule>
    <title>Wrapper Rule (JSON Enclosure)</title>
    <details>
      Router Controllers in @ecosy/hoapp are strictly prohibited from returning bare JSON objects utilizing raw Hono functions (e.g. `return ctx.json({ a: 1 })`). 
      You MUST use the `HttpResult` object to wrap the data layer. The generated result will always follow the encapsulated JSON pattern:
      `{ success: true, data: { a: 1 } }`
    </details>
  </rule>

  <rule>
    <title>Working with HttpResult</title>
    <details>
      Initialize the object using the syntax `new HttpResult(YOUR_DATA)`. The Output data (Array, Object, or String) will be automatically mapped to the `data` attribute of the API response.
      After initialization, use the `.json(ctx)` method to cast and return the data stream back to the router's Context.
    </details>
  </rule>

  <rule>
    <title>Custom HTTP Status Codes</title>
    <details>
      By default, `new HttpResult().json(ctx)` will automatically append the HTTP 200 (OK) status code.
      If your API Logic needs to return special meaningful HTTP Success methods (like 201 Created after Posting/Adding data), you must call the builder method `.status()` before `.json()`.
      Example: `return new HttpResult(user).status(201).json(ctx);`
    </details>
  </rule>

</instructions>

<examples>
  <example>
    <description>Illustrative examples spanning normal Data, Arrays, to changing HTTP codes like 201 Created with HttpResult</description>
    <reference_path>./examples/index.ts</reference_path>
  </example>
</examples>
