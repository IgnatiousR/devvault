import { describe, it, expect } from "vitest";
import { registerSchema, signInSchema } from "./schemas";

describe("registerSchema", () => {
  it("returns errors for invalid form data", () => {
    const result = registerSchema.safeParse({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.name).toContain("Name is required");
      expect(errors.email).toContain("Please enter a valid email");
      expect(errors.password).toContain("Password must be at least 8 characters");
    }
  });

  it("returns errors for mismatched passwords", () => {
    const result = registerSchema.safeParse({
      name: "John",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.confirmPassword).toContain("Passwords do not match");
    }
  });

  it("returns success for valid form data", () => {
    const result = registerSchema.safeParse({
      name: "John",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(true);
  });
});

describe("signInSchema", () => {
  it("returns errors for invalid form data", () => {
    const result = signInSchema.safeParse({
      email: "",
      password: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.email).toContain("Please enter a valid email");
      expect(errors.password).toContain("Password is required");
    }
  });

  it("returns success for valid form data", () => {
    const result = signInSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });
});
