import { describe, it, expect } from "vitest";
import { cors } from "./cors";
import { Router } from "./router";

describe("Cors Middleware", () => {
  it("should process default CORS headers cleanly", async () => {
    const corsDesc = cors()
      .use(async (c) => c.text("ok"));

    const router = new Router();
    router.options(corsDesc);
    router.get(corsDesc);

    const app = Router.create();
    Router.add(app, router);

    const checkOptions = await app.request("/", { method: "OPTIONS" });
    const checkGet = await app.request("/", { method: "GET" });

    expect(checkGet.status).toBe(200);
    expect(checkOptions.status).toBe(204); // Default OPTIONS returns empty 204 from native Hono
    expect(checkOptions.headers.get("Access-Control-Allow-Methods")).toBeTruthy();
  });

  it("should appropriately match subdomains based on strict origin whitelist injections", async () => {
    const corsDesc = cors({ origins: ["https://ecosy.io", ".ecosy.io"] })
      .use(async (c) => c.text("ok"));

    const app = Router.create();
    const rt = new Router();
    rt.get(corsDesc);
    Router.add(app, rt);

    const validReq = await app.request("/", { 
      method: "GET",
      headers: { Origin: "https://api.ecosy.io" }
    });

    const invalidReq = await app.request("/", { 
      method: "GET",
      headers: { Origin: "https://hacker.com" }
    });

    expect(validReq.headers.get("Access-Control-Allow-Origin")).toBe("https://api.ecosy.io");
    expect(invalidReq.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });
});
