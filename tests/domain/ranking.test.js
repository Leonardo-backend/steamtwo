import { describe, it, expect } from "vitest";
import { normalizePosition, weeklyAverage, peakIndex, clamp, colorForSlug } from "../../server/domain/ranking.js";

describe("normalizePosition", () => {
  it("posição 1 em league 100 → 100", () => expect(normalizePosition(1, 100)).toBe(100));
  it("posição 100 em league 100 → 1", () => expect(normalizePosition(100, 100)).toBe(1));
  it("posição 50 em league 100 → 51", () => expect(normalizePosition(50, 100)).toBe(51));
  it("posição nula → 0", () => expect(normalizePosition(null, 100)).toBe(0));
  it("sem league → 0", () => expect(normalizePosition(1, null)).toBe(0));
  it("nunca ultrapassa 100", () => expect(normalizePosition(0, 100)).toBe(100));
});

describe("weeklyAverage", () => {
  it("média simples", () => expect(weeklyAverage([1, 4, 6])).toBe(4));
  it("null quando vazio", () => expect(weeklyAverage([])).toBe(null));
  it("ignora nulos", () => expect(weeklyAverage([2, null, 4])).toBe(3));
});

describe("peakIndex", () => {
  it("peak = max → 100", () => expect(peakIndex(500, 500)).toBe(100));
  it("peak 0/max → 0", () => expect(peakIndex(0, 500)).toBe(0));
  it("peak nulo → 0", () => expect(peakIndex(null, 500)).toBe(0));
});

describe("clamp / colorForSlug", () => {
  it("clamp bounded", () => {
    expect(clamp(200)).toBe(100);
    expect(clamp(-5)).toBe(0);
    expect(clamp(42)).toBe(42);
  });
  it("cor determinística", () => {
    expect(colorForSlug("a")).toBe(colorForSlug("a"));
    expect(colorForSlug("a")).toMatch(/^hsl\(/);
  });
});
