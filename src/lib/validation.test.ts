import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateName,
  validateConfirmPassword,
  validateRegisterForm,
  validateSignInForm,
} from "./validation";

describe("validateEmail", () => {
  it("returns error for empty email", () => {
    expect(validateEmail("")).toBe("Email is required");
  });

  it("returns error for invalid email format", () => {
    expect(validateEmail("invalid")).toBe("Please enter a valid email");
    expect(validateEmail("test@")).toBe("Please enter a valid email");
    expect(validateEmail("@domain.com")).toBe("Please enter a valid email");
  });

  it("returns undefined for valid email", () => {
    expect(validateEmail("test@example.com")).toBeUndefined();
    expect(validateEmail("user+tag@domain.co")).toBeUndefined();
  });
});

describe("validatePassword", () => {
  it("returns error for empty password", () => {
    expect(validatePassword("")).toBe("Password is required");
  });

  it("returns error for short password", () => {
    expect(validatePassword("1234567")).toBe("Password must be at least 8 characters");
  });

  it("returns undefined for valid password", () => {
    expect(validatePassword("password123")).toBeUndefined();
  });
});

describe("validateName", () => {
  it("returns error for empty name", () => {
    expect(validateName("")).toBe("Name is required");
  });

  it("returns undefined for valid name", () => {
    expect(validateName("John")).toBeUndefined();
  });
});

describe("validateConfirmPassword", () => {
  it("returns error for empty confirm password", () => {
    expect(validateConfirmPassword("password", "")).toBe("Please confirm your password");
  });

  it("returns error for mismatched passwords", () => {
    expect(validateConfirmPassword("password", "different")).toBe("Passwords do not match");
  });

  it("returns undefined for matching passwords", () => {
    expect(validateConfirmPassword("password", "password")).toBeUndefined();
  });
});

describe("validateRegisterForm", () => {
  it("returns errors for invalid form data", () => {
    const errors = validateRegisterForm("", "", "", "");
    expect(errors.name).toBe("Name is required");
    expect(errors.email).toBe("Email is required");
    expect(errors.password).toBe("Password is required");
    expect(errors.confirmPassword).toBe("Please confirm your password");
  });

  it("returns errors for mismatched passwords", () => {
    const errors = validateRegisterForm("John", "test@example.com", "password123", "different");
    expect(errors.confirmPassword).toBe("Passwords do not match");
  });

  it("returns empty object for valid form data", () => {
    const errors = validateRegisterForm("John", "test@example.com", "password123", "password123");
    expect(Object.keys(errors)).toHaveLength(0);
  });
});

describe("validateSignInForm", () => {
  it("returns errors for invalid form data", () => {
    const errors = validateSignInForm("", "");
    expect(errors.email).toBe("Email is required");
    expect(errors.password).toBe("Password is required");
  });

  it("returns empty object for valid form data", () => {
    const errors = validateSignInForm("test@example.com", "password123");
    expect(Object.keys(errors)).toHaveLength(0);
  });
});
