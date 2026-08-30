import { describe, it, expect } from "vitest";
import { computeDashboard } from "../../server/data/fallback.js";

// Integração leve: garante que o contrato do dashboard é estável (sem rede).
describe("contrato do dashboard", () => {
  it("tem as chaves esperadas", () => {
    const d = computeDashboard();
    for (const k of ["hero", "now", "lastWeek", "allTime", "top5", "record", "sources"]) {
      expect(d).toHaveProperty(k);
    }
  });

  it("hero tem os campos do front", () => {
    const { hero } = computeDashboard();
    expect(hero).toHaveProperty("name");
    expect(hero).toHaveProperty("description");
    expect(hero).toHaveProperty("storeLink");
  });

  it("top5 é array de 5 e ordenado por índice", () => {
    const d = computeDashboard();
    expect(d.top5).toHaveLength(5);
    for (let i = 1; i < d.top5.length; i++) {
      expect(d.top5[i].index).toBeLessThanOrEqual(d.top5[i - 1].index);
    }
  });

  it("fontes lista Steam como disponível", () => {
    const { sources } = computeDashboard();
    expect(sources.some((s) => s.id === "steam" && s.available)).toBe(true);
  });
});
