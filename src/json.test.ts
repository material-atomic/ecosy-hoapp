import { describe, it, expect } from "vitest";
import { json } from "./json";
import { Router } from "./router";

describe("JSON Application Assessor", () => {
  it("should bypass JSON restrictions seamlessly for GET/HEAD methods", async () => {
    const testRouter = new Router();
    testRouter.get(json.use(async (c) => c.text("get ok")));

    const app = Router.create();
    Router.add(app, testRouter);

    const res = await app.request("/");
    expect(res.status).toBe(200);
  });

  it("should bypass restrictions for empty POST bodies completely", async () => {
    const testRouter = new Router();
    testRouter.post(json.use(async (c) => c.text("post ok")));

    const app = Router.create();
    Router.add(app, testRouter);

    // No Content-Length or Content-Length 0
    const res = await app.request("/", { method: "POST" });
    expect(res.status).toBe(200);
  });

  it("should throw HTTP 415 natively when mutator transports strict payload lengths over unspecified content-types", async () => {
    const testRouter = new Router();
    testRouter.post(json.use(async (c) => c.text("post bypass fails")));

    const app = Router.create();
    Router.add(app, testRouter);

    const req = new Request("http://localhost/", {
      method: "POST",
      body: "plain string data object",
      headers: { "Content-Type": "text/plain", "Content-Length": "24" }
    });
    
    const res = await app.request(req);
    // Router should interpret unsupported-media-type strictly to 415 via HttpResult encapsulation mapping
    expect(res.status).toBe(415);
    const apiJson = await res.json();
    expect(apiJson.success).toBe(false);
  });

  it("should seamlessly transition and unpack structured payloads assuming matched signatures", async () => {
    const testRouter = new Router();
    testRouter.post(json.use(async (c) => c.text("valid")));

    const app = Router.create();
    Router.add(app, testRouter);

    const req = new Request("http://localhost/", {
      method: "POST",
      body: '{"ping":"pong"}',
      headers: { "Content-Type": "application/json", "Content-Length": "15" }
    });
    
    const res = await app.request(req);
    expect(res.status).toBe(200);
  });
});
