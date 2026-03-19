/**
 * Unit tests for the assertion library
 */

import { expect, AssertionError } from "../src/assertions/index.js";

let failures = 0;
let passes = 0;

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✘ FAIL: ${message}`);
    failures++;
  } else {
    console.log(`  ✔ PASS: ${message}`);
    passes++;
  }
}

function assertThrows(fn: () => void, message: string): void {
  try {
    fn();
    console.error(`  ✘ FAIL: ${message} — expected to throw`);
    failures++;
  } catch (e) {
    if (e instanceof AssertionError) {
      console.log(`  ✔ PASS: ${message}`);
      passes++;
    } else {
      console.error(`  ✘ FAIL: ${message} — threw non-AssertionError`);
      failures++;
    }
  }
}

async function assertThrowsAsync(fn: () => Promise<void>, message: string): Promise<void> {
  try {
    await fn();
    console.error(`  ✘ FAIL: ${message} — expected to throw`);
    failures++;
  } catch (e) {
    if (e instanceof AssertionError) {
      console.log(`  ✔ PASS: ${message}`);
      passes++;
    } else {
      console.error(`  ✘ FAIL: ${message} — threw non-AssertionError: ${e}`);
      failures++;
    }
  }
}

async function assertDoesNotThrow(fn: () => Promise<void>, message: string): Promise<void> {
  try {
    await fn();
    console.log(`  ✔ PASS: ${message}`);
    passes++;
  } catch (e) {
    console.error(`  ✘ FAIL: ${message} — unexpected error: ${e instanceof Error ? e.message : String(e)}`);
    failures++;
  }
}

function section(name: string): void {
  console.log(`\n📦 ${name}`);
}

// ── toBe ───────────────────────────────────────────────────────

section("Assertions — toBe");

expect(42).toBe(42);
assert(true, "toBe passes with equal primitives");

assertThrows(() => expect(42).toBe(43), "toBe fails with unequal primitives");

const obj = { a: 1 };
expect(obj).toBe(obj);
assert(true, "toBe passes with same object reference");

assertThrows(() => expect({ a: 1 }).toBe({ a: 1 }), "toBe fails with different object references");

// ── toEqual ────────────────────────────────────────────────────

section("Assertions — toEqual");

expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 });
assert(true, "toEqual passes with deep equal objects");

expect([1, 2, 3]).toEqual([1, 2, 3]);
assert(true, "toEqual passes with equal arrays");

assertThrows(() => expect({ a: 1 }).toEqual({ a: 2 }), "toEqual fails with different objects");

// ── toBeGreaterThan / toBeLessThan ─────────────────────────────

section("Assertions — numeric comparisons");

expect(10).toBeGreaterThan(5);
assert(true, "toBeGreaterThan passes");

assertThrows(() => expect(5).toBeGreaterThan(10), "toBeGreaterThan fails");

expect(5).toBeLessThan(10);
assert(true, "toBeLessThan passes");

assertThrows(() => expect(10).toBeLessThan(5), "toBeLessThan fails");

expect(10).toBeGreaterThanOrEqual(10);
assert(true, "toBeGreaterThanOrEqual passes with equal");

expect(10).toBeLessThanOrEqual(10);
assert(true, "toBeLessThanOrEqual passes with equal");

// ── toContain ──────────────────────────────────────────────────

section("Assertions — toContain");

expect("hello world").toContain("world");
assert(true, "toContain passes with string substring");

expect([1, 2, 3]).toContain(2);
assert(true, "toContain passes with array item");

assertThrows(() => expect("hello").toContain("world"), "toContain fails with missing substring");

assertThrows(() => expect([1, 2, 3]).toContain(4), "toContain fails with missing array item");

// ── toHaveProperty ─────────────────────────────────────────────

section("Assertions — toHaveProperty");

expect({ name: "John", age: 30 }).toHaveProperty("name");
assert(true, "toHaveProperty passes with existing property");

expect({ name: "John" }).toHaveProperty("name", "John");
assert(true, "toHaveProperty passes with matching value");

assertThrows(() => expect({ name: "John" }).toHaveProperty("age"), "toHaveProperty fails with missing property");

assertThrows(() => expect({ name: "John" }).toHaveProperty("name", "Jane"), "toHaveProperty fails with wrong value");

// ── toHaveLength ───────────────────────────────────────────────

section("Assertions — toHaveLength");

expect([1, 2, 3]).toHaveLength(3);
assert(true, "toHaveLength passes with array");

expect("hello").toHaveLength(5);
assert(true, "toHaveLength passes with string");

assertThrows(() => expect([1, 2]).toHaveLength(3), "toHaveLength fails with wrong length");

// ── toMatchObject ──────────────────────────────────────────────

section("Assertions — toMatchObject");

expect({ a: 1, b: 2, c: 3 }).toMatchObject({ a: 1, b: 2 });
assert(true, "toMatchObject passes with partial match");

assertThrows(() => expect({ a: 1 }).toMatchObject({ a: 2 }), "toMatchObject fails with different values");

// ── toMatch ────────────────────────────────────────────────────

section("Assertions — toMatch");

expect("hello world").toMatch(/world/);
assert(true, "toMatch passes with regex");

expect("test@example.com").toMatch("@");
assert(true, "toMatch passes with string pattern");

assertThrows(() => expect("hello").toMatch(/world/), "toMatch fails with non-matching regex");

// ── toStartWith / toEndWith ────────────────────────────────────

section("Assertions — toStartWith / toEndWith");

expect("hello world").toStartWith("hello");
assert(true, "toStartWith passes");

expect("hello world").toEndWith("world");
assert(true, "toEndWith passes");

assertThrows(() => expect("hello").toStartWith("world"), "toStartWith fails");

assertThrows(() => expect("hello").toEndWith("world"), "toEndWith fails");

// ── toBeTruthy / toBeFalsy ─────────────────────────────────────

section("Assertions — toBeTruthy / toBeFalsy");

expect(true).toBeTruthy();
expect(1).toBeTruthy();
expect("hello").toBeTruthy();
assert(true, "toBeTruthy passes with truthy values");

expect(false).toBeFalsy();
expect(0).toBeFalsy();
expect("").toBeFalsy();
assert(true, "toBeFalsy passes with falsy values");

assertThrows(() => expect(false).toBeTruthy(), "toBeTruthy fails with false");

assertThrows(() => expect(true).toBeFalsy(), "toBeFalsy fails with true");

// ── toBeNull / toBeUndefined / toBeDefined ─────────────────────

section("Assertions — null/undefined checks");

expect(null).toBeNull();
assert(true, "toBeNull passes");

expect(undefined).toBeUndefined();
assert(true, "toBeUndefined passes");

expect(42).toBeDefined();
assert(true, "toBeDefined passes");

assertThrows(() => expect(42).toBeNull(), "toBeNull fails with non-null");

assertThrows(() => expect(42).toBeUndefined(), "toBeUndefined fails with defined value");

assertThrows(() => expect(undefined).toBeDefined(), "toBeDefined fails with undefined");

// ── toBeNaN ────────────────────────────────────────────────────

section("Assertions — toBeNaN");

expect(NaN).toBeNaN();
assert(true, "toBeNaN passes");

assertThrows(() => expect(42).toBeNaN(), "toBeNaN fails with number");

// ── toBeInstanceOf ─────────────────────────────────────────────

section("Assertions — toBeInstanceOf");

class MyClass {}
const instance = new MyClass();

expect(instance).toBeInstanceOf(MyClass);
assert(true, "toBeInstanceOf passes");

expect(new Date()).toBeInstanceOf(Date);
assert(true, "toBeInstanceOf passes with Date");

assertThrows(() => expect({}).toBeInstanceOf(Array), "toBeInstanceOf fails with wrong class");

// ── Async — resolves ───────────────────────────────────────────

section("Assertions — async resolves");

await assertDoesNotThrow(
  async () => await expect(Promise.resolve(42)).resolves.toBe(42),
  "resolves.toBe passes"
);

await assertThrowsAsync(
  async () => await expect(Promise.resolve(42)).resolves.toBe(43),
  "resolves.toBe fails"
);

await assertDoesNotThrow(
  async () => await expect(Promise.resolve([1, 2, 3])).resolves.toHaveLength(3),
  "resolves.toHaveLength passes"
);

await assertThrowsAsync(
  async () => await expect(Promise.reject(new Error("failed"))).resolves.toBe(42),
  "resolves fails when promise rejects"
);

// ── Async — rejects ────────────────────────────────────────────

section("Assertions — async rejects");

await assertDoesNotThrow(
  async () => await expect(Promise.reject(new Error("failed"))).rejects.toThrow(),
  "rejects.toThrow passes"
);

await assertDoesNotThrow(
  async () => await expect(Promise.reject(new Error("failed"))).rejects.toThrow("failed"),
  "rejects.toThrow passes with message"
);

await assertDoesNotThrow(
  async () => await expect(Promise.reject(new Error("failed"))).rejects.toThrow(/fail/),
  "rejects.toThrow passes with regex"
);

await assertThrowsAsync(
  async () => await expect(Promise.resolve(42)).rejects.toThrow(),
  "rejects.toThrow fails when promise resolves"
);

// ── Web matchers (mock) ────────────────────────────────────────

section("Assertions — web matchers");

// Create mock locator
const mockLocator = {
  textContent: async () => "Hello World",
  inputValue: async () => "test@example.com",
  isVisible: async () => true,
  isHidden: async () => false,
  isEnabled: async () => true,
  isDisabled: async () => false,
  isChecked: async () => true,
  getAttribute: async (name: string) => (name === "class" ? "btn primary" : "test-value"),
  count: async () => 5,
};

await assertDoesNotThrow(
  async () => await expect(mockLocator as any).toHaveText("Hello World"),
  "toHaveText passes"
);

await assertThrowsAsync(
  async () => await expect(mockLocator as any).toHaveText("Goodbye"),
  "toHaveText fails"
);

await assertDoesNotThrow(
  async () => await expect(mockLocator as any).toContainText("World"),
  "toContainText passes"
);

await assertDoesNotThrow(
  async () => await expect(mockLocator as any).toHaveValue("test@example.com"),
  "toHaveValue passes"
);

await assertDoesNotThrow(
  async () => await expect(mockLocator as any).toBeVisible(),
  "toBeVisible passes"
);

await assertDoesNotThrow(
  async () => await expect(mockLocator as any).toBeEnabled(),
  "toBeEnabled passes"
);

await assertDoesNotThrow(
  async () => await expect(mockLocator as any).toBeChecked(),
  "toBeChecked passes"
);

await assertDoesNotThrow(
  async () => await expect(mockLocator as any).toHaveAttribute("class"),
  "toHaveAttribute passes"
);

await assertDoesNotThrow(
  async () => await expect(mockLocator as any).toHaveClass("primary"),
  "toHaveClass passes"
);

await assertDoesNotThrow(
  async () => await expect(mockLocator as any).toHaveCount(5),
  "toHaveCount passes"
);

// ── Page matchers (mock) ───────────────────────────────────────

section("Assertions — page matchers");

const mockPage = {
  url: () => "https://example.com/dashboard",
  title: async () => "Dashboard - Example App",
  locator: (selector: string) => mockLocator,
};

await assertDoesNotThrow(
  async () => await expect(mockPage as any).toHaveURL("https://example.com/dashboard"),
  "toHaveURL passes with string"
);

await assertDoesNotThrow(
  async () => await expect(mockPage as any).toHaveURL(/dashboard/),
  "toHaveURL passes with regex"
);

await assertDoesNotThrow(
  async () => await expect(mockPage as any).toHaveTitle("Dashboard - Example App"),
  "toHaveTitle passes"
);

await assertThrowsAsync(
  async () => await expect(mockPage as any).toHaveURL("https://wrong.com"),
  "toHaveURL fails"
);

// ── Summary ────────────────────────────────────────────────────

console.log("\n" + "=".repeat(50));
console.log(`\n📊 Assertion Tests: ${passes} passed, ${failures} failed\n`);

if (failures > 0) {
  process.exit(1);
}
