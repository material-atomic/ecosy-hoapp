import { describe, it, expect } from "vitest";
import { HttpResult, Unauthorized, OK, HttpError } from "./result";

describe("HTTP Standardized Encapsulation Modules", () => {
  it("should initialize unadulterated Native Custom Formats safely and robustly", () => {
    const std = new HttpResult(true, "OK", 200, "Successfully executed", { magic: 123 });
    const dict = std.get();
    
    expect(dict.success).toBe(true);
    expect(dict.status).toBe(200);
    expect(dict.data).toStrictEqual({ magic: 123 });
    expect(dict.error).toBeNull();
  });

  it("should mutate subclass errors dynamically extending standardized formats recursively", () => {
    const err = new Unauthorized("Missing credentials", { token: "expired" });
    const wrap = err.result.get();

    expect(wrap.success).toBe(false);
    expect(wrap.status).toBe(401);
    expect(wrap.message).toBe("Unauthorized");
    expect(wrap.error?.message).toBe("Missing credentials");
    expect(wrap.error?.detail).toStrictEqual({ token: "expired" });
  });

  it("maps internal abstractions cleanly utilizing HttpSuccess derivations", () => {
    const ok = new OK({ user: 1 }, "Login Successfully");
    const shape = ok.result.get();

    expect(shape.success).toBe(true);
    expect(shape.data).toStrictEqual({ user: 1 });
    expect(shape.status).toBe(200);
    expect(shape.message).toBe("OK"); // For Successes, internal mapping exposes statusText statically
  });
  
  it("maps native javascript faults seamlessly onto internal server errors", () => {
    const jErr = new Error("File not found descriptor proxy.");
    const built = HttpError.internalServer(jErr);
    
    // Validating inheritance chain formats correctly preserving explicit details
    expect(built.message).toBe("File not found descriptor proxy.");
    expect(built.result.get().status).toBe(500);
  });
});
