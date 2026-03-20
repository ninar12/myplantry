import { describe, it, expect } from "vitest";
import { parseAiJsonArray } from "@/lib/parseAiResponse";

describe("parseAiJsonArray", () => {
  it("parses a clean JSON array", () => {
    const input = `[{"name":"Milk","category":"dairy","quantity":1}]`;
    expect(parseAiJsonArray(input)).toEqual([
      { name: "Milk", category: "dairy", quantity: 1 },
    ]);
  });

  it("strips ```json fences", () => {
    const input = "```json\n[{\"name\":\"Eggs\",\"category\":\"dairy\",\"quantity\":12}]\n```";
    expect(parseAiJsonArray(input)).toEqual([
      { name: "Eggs", category: "dairy", quantity: 12 },
    ]);
  });

  it("strips plain ``` fences", () => {
    const input = "```\n[{\"name\":\"Butter\",\"category\":\"dairy\",\"quantity\":1}]\n```";
    expect(parseAiJsonArray(input)).toEqual([
      { name: "Butter", category: "dairy", quantity: 1 },
    ]);
  });

  it("returns empty array for invalid JSON", () => {
    expect(parseAiJsonArray("not json at all")).toEqual([]);
  });

  it("returns empty array when model returns a non-array object", () => {
    expect(parseAiJsonArray(`{"name":"Milk"}`)).toEqual([]);
  });

  it("returns empty array for empty input", () => {
    expect(parseAiJsonArray("")).toEqual([]);
  });

  it("returns empty array for empty JSON array", () => {
    expect(parseAiJsonArray("[]")).toEqual([]);
  });

  it("handles multiple items", () => {
    const input = `[
      {"name":"Apples","category":"produce","quantity":3},
      {"name":"Cheddar","category":"dairy","quantity":1}
    ]`;
    const result = parseAiJsonArray(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ name: "Apples" });
    expect(result[1]).toMatchObject({ name: "Cheddar" });
  });
});
