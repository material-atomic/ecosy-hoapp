import { describe, it, expect } from "vitest";
import { Router } from "./router";
import { Descriptor, createDescriptor } from "./descriptor";

describe("Router Ecosystem Instantiation", () => {
  it("should initialize default base paths properly and encapsulate inner methods seamlessly", async () => {
    const parent = new Router("/v1");
    const child = new Router("/users");

    child.get(Descriptor({ url: "/profile" }).use(async (c) => c.text("profile active")));
    parent.add(child);

    const app = Router.create();
    Router.add(app, parent);

    // Deep nesting verification (/v1 + /users + /profile)
    const valid = await app.request("/v1/users/profile");
    expect(valid.status).toBe(200);
    expect(await valid.text()).toBe("profile active");

    const invalid = await app.request("/v1/users/unknown");
    // Should fallback seamlessly to Router.notFound producing a formalized Error 404 payload
    expect(invalid.status).toBe(404);
  });

  it("should transparently capture runtime unhandled errors transforming into 500 JSON formatted responses", async () => {
    const errRoute = new Router("/fail");
    errRoute.get(Descriptor({}).use(async () => {
      throw new Error("Simulated Crash Code Execution.");
    }));

    const app = Router.create();
    Router.add(app, errRoute);

    const res = await app.request("/fail");
    expect(res.status).toBe(500);

    const payload = await res.json();
    expect(payload.success).toBe(false);
    expect(payload.message).toBe("Internal Server Error");
    expect(payload.error.message).toBe("Simulated Crash Code Execution.");
  });

  it("should map explicitly provided use() interceptors universally", async () => {
    const mwNode = createDescriptor(async (c, next) => {
      c.set("jwtPayload", true);
      await next();
    });

    const rt = new Router("/");
    rt.use(mwNode);
    rt.get(Descriptor({ url: "/verify" }).use(async (c) => {
      const isPassed = c.get("jwtPayload");
      return c.json({ passed: isPassed });
    }));

    const app = Router.create();
    Router.add(app, rt);

    const check = await app.request("/verify");
    const body = await check.json();
    expect(body.passed).toBe(true);
  });
});
