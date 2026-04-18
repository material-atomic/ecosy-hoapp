import { Descriptor } from "./descriptor";
import { UnsupportedMediaType } from "./result";
import type { Next } from "hono";
import type { RouteContext } from "./types/router";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const json = Descriptor({ 
  summary: "Enforce application/json for mutating requests" 
}).use(async (ctx: RouteContext, next: Next) => {
  if (!MUTATING.has(ctx.req.method)) {
    return await next();
  }

  const lengthHeader = ctx.req.header("content-length");
  const hasBody = lengthHeader !== undefined && Number(lengthHeader) > 0;

  if (!hasBody) {
    return await next();
  }

  const contentType = (ctx.req.header("content-type") ?? "").toLowerCase();

  if (!contentType.includes("application/json")) {
    throw new UnsupportedMediaType("Unsupported Media Type", {
      expected: "application/json",
      received: contentType,
    });
  }

  return await next();
});
