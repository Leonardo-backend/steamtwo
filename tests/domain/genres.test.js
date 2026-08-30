import { describe, it, expect } from "vitest";
import { normalizeGenre, normalizeGenres } from "../../server/domain/genres.js";

describe("normalizeGenre", () => {
  it("mapeia inglês → PT", () => {
    expect(normalizeGenre("Action")).toBe("Ação");
    expect(normalizeGenre("RPG")).toBe("RPG");
    expect(normalizeGenre("Strategy")).toBe("Estratégia");
    expect(normalizeGenre("Massively Multiplayer")).toBe("MMO");
    expect(normalizeGenre("Free to Play")).toBe("Gratuito");
  });
  it("fallback para Outros", () => expect(normalizeGenre("")).toBe("Outros"));
  it("gêneros já PT passam", () => expect(normalizeGenre("FPS")).toBe("FPS"));
});

describe("normalizeGenres", () => {
  it("deduplica e filtra vazios", () => {
    expect(normalizeGenres(["action", "", "Action"])).toEqual(["Ação"]);
  });
});
