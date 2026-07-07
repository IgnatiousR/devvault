import { describe, it, expect } from "vitest";
import { getIpFromHeaders } from "./rate-limit";

describe("getIpFromHeaders", () => {
  it("extracts IP from x-forwarded-for header", () => {
    const headers = new Headers();
    headers.set("x-forwarded-for", "192.168.1.1, 10.0.0.1");
    expect(getIpFromHeaders(headers)).toBe("192.168.1.1");
  });

  it("extracts IP from x-real-ip header when x-forwarded-for is missing", () => {
    const headers = new Headers();
    headers.set("x-real-ip", "192.168.1.1");
    expect(getIpFromHeaders(headers)).toBe("192.168.1.1");
  });

  it("returns unknown when no IP headers present", () => {
    const headers = new Headers();
    expect(getIpFromHeaders(headers)).toBe("unknown");
  });

  it("trims whitespace from x-forwarded-for", () => {
    const headers = new Headers();
    headers.set("x-forwarded-for", "  192.168.1.1 , 10.0.0.1");
    expect(getIpFromHeaders(headers)).toBe("192.168.1.1");
  });
});
