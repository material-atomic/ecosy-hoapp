import { describe, it, expect } from "vitest";
import { basic, bearer } from "./auth";
import { Router } from "./index";

describe("Auth Middleware Native Refinement", () => {
  it("should natively generate and process HTTP Basic Authentication errors without explicit options casting", async () => {
    const basicAuthDesc = basic({ username: "admin", password: "123" })
      .refine({ url: "/admin" })
      .use(async (c) => c.json({ success: true }));

    const testRouter = new Router("/");
    testRouter.get(basicAuthDesc);

    const app = Router.create();
    Router.add(app, testRouter);

    // Call without auth => 401 Unauthorized expected
    const res = await app.request("/admin");
    expect(res.status).toBe(401);

    // Call with correct basic auth => 200 Expected
    const token = btoa("admin:123");
    const authedRes = await app.request("/admin", {
      headers: { Authorization: `Basic ${token}` }
    });
    expect(authedRes.status).toBe(200);
  });

  it("should accurately process standard Bearer Tokens configuration injections", async () => {
    const bearerDesc = bearer({ token: "SUPER-SECRET" })
      .refine({ url: "/token-zone" })
      .use(async (c) => c.json({ ok: true }));
    const testRouter = new Router("/");
    
    testRouter.get(bearerDesc);

    const app = Router.create();
    Router.add(app, testRouter);

    const failReq = await app.request("/token-zone");
    expect(failReq.status).toBe(401);

    const passReq = await app.request("/token-zone", {
      headers: { Authorization: `Bearer SUPER-SECRET` }
    });
    
    expect(passReq.status).toBe(200);
  });
});
