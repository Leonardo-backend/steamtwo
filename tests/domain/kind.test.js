import { describe, it, expect } from "vitest";
import { isGame, nonGameReason } from "../../server/domain/kind.js";

describe("isGame — classificação de não-jogos", () => {
  it("Palworld é jogo (regressão)", () => {
    expect(isGame({ appid: 1623730, name: "Palworld", slug: "steam-1623730" })).toBe(true);
  });
  it("FiveM é não-jogo", () => expect(isGame({ appid: 2676230, name: "FiveM", slug: "steam-2676230" })).toBe(false));
  it("Bongo Cat é não-jogo", () => expect(isGame({ appid: 3419430, name: "Bongo Cat", slug: "steam-3419430" })).toBe(false));
  it("Wallpaper Engine é não-jogo", () => expect(isGame({ appid: 431960, name: "Wallpaper Engine" })).toBe(false));
  it("jogo comum (CS2) é jogo", () => expect(isGame({ appid: 730, name: "Counter-Strike 2", slug: "counter-strike-2" })).toBe(true));
  it("motivo do FiveM é específico", () => expect(nonGameReason({ appid: 2676230, name: "FiveM" })).toMatch(/GTA/));
});
