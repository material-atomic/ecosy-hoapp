import { Router, json, cors } from "@ecosy/hoapp";
import { jwt } from "@ecosy/hoapp/auth";
import { createDescriptor, Descriptor } from "@ecosy/hoapp/descriptor";
import { HttpResult } from "@ecosy/hoapp";

/**
 * 1. Package custom Middleware (Generate a Custom Descriptor wrapper)
 */
const rateLimiter = createDescriptor(async (c, next) => {
  console.log("Process isolated manual Rate Limit mechanisms");
  await next();
});

/**
 * 2. Configure Global Middlewares mapping across the Root Router
 */
const app = Router.create({
  base: "/",
  middlewares: [
    // Cross-Origin sharing enabled globally 
    cors({ origins: ["*"] }),
    
    // JSON Parser restricted locally to apply merely to /api bound endpoints
    json.url("/api/*"),
    
    // Auth JWT validation locked selectively to /admin by invoking .url()
    // (Never trigger .refine() to declare metadata here as doing so allocates wasteful unreferenced memory)
    jwt({ secret: "SECRET_KEY" }).url("/admin/*")
  ]
});

// 3. Integrating inside an explicit localized Route Instance
const router = new Router("/users");

const secretRouteDesc = Descriptor({
  url: "/secret",
  summary: "Secure Fetch Logic",
  responses: { 200: { description: "Success" } }
}).use(...rateLimiter.forRoute()); // Extract standard handlers via .forRoute()!

router.get(secretRouteDesc, async (c) => {
  return new HttpResult({ secret: "Hello" }).json(c);
});

Router.add(app, router);
export default app;
