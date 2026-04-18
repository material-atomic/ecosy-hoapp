/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty */
import { Descriptor } from "./descriptor";
import { cors as honoCors } from "hono/cors";
import type { RouteContext } from "./types/router";
import type { Next } from "hono";

export const DEFAULT_ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
export const DEFAULT_ALLOWED_HEADERS = ["Content-Type", "Authorization"];

export interface CorsOptions {
  url?: string;
  origins?: string[];
  methods?: string[];
  credentials?: boolean;
  headers?: string[];
  maxAge?: number;
}

export const cors = (options: CorsOptions = {}) => {
  const {
    url,
    origins = [],
    credentials = true,
    maxAge = 86400,
    methods = DEFAULT_ALLOWED_METHODS,
    headers = DEFAULT_ALLOWED_HEADERS,
  } = options;

  const rawMiddleware = honoCors({
    origin: (origin) => {
      if (!origin) return null;
      if (origins.includes("*")) return origin;
      if (origins.includes(origin)) return origin;
      for (const allowed of origins) {
        if (allowed.startsWith(".")) {
          try {
            const url = new URL(origin);
            if (url.hostname.endsWith(allowed)) return origin;
          } catch {}
        }
      }
      return null;
    },
    allowMethods: [...methods],
    allowHeaders: [...headers],
    credentials,
    maxAge,
  });

  const wrappedCors = Descriptor({
    url,
    summary: "Cross-Origin Resource Sharing"
  }).use(async (ctx: RouteContext, next: Next) => {
    return await rawMiddleware(ctx as any, next);
  });

  return wrappedCors;
};

cors.DEFAULT_METHODS = DEFAULT_ALLOWED_METHODS;
cors.DEFAULT_HEADERS = DEFAULT_ALLOWED_HEADERS;
