import { describe, expect, it } from "vitest";
import app from "@/index";

describe("GET /", () => {
  it("returns 200", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
  });
});
