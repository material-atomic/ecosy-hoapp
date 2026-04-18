/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { Descriptor, createDescriptor } from "./descriptor";

describe("Descriptor Mechanics", () => {
  it("should embed static metadata correctly over Route Refine inheritance", () => {
    const base = Descriptor({ summary: "Base", tags: ["A"] });
    const refined = base.refine({ url: "/home", summary: "Refined" });

    // Assert freezing structure preserves merged configuration
    expect(refined.descriptor.url).toBe("/home");
    expect(refined.descriptor.summary).toBe("Refined");
    expect(refined.descriptor.tags).toEqual(["A"]);
    expect(base.descriptor.summary).toBe("Base");
  });

  it("should generate handle lists optimally without crashing", () => {
    const custom = createDescriptor(((async (c: any, next: any) => {
      await next();
      return c.json({ ok: true });
    }) as any));
    
    // Evaluate standard creation output shape length
    expect(custom.forRoute().length).toBeGreaterThan(0);
  });
});
