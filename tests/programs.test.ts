import { describe, expect, it } from "vitest";
import { programsForArea } from "@/lib/programs";

describe("programsForArea", () => {
  it("keeps only the most local program per group for 福岡市", () => {
    const ids = programsForArea("福岡県", "福岡市").map((p) => p.id);
    expect(ids).toContain("fukuoka-city-koto-shokugyo-kunren");
    expect(ids).not.toContain("jp-koto-shokugyo-kunren-kyufukin");
    expect(ids).not.toContain("fukuoka-pref-koto-shokugyo-kunren");
    expect(ids).not.toContain("kitakyushu-city-koto-shokugyo-kunren");
    expect(ids).toContain("jp-jido-fuyo-teate");
  });
  it("shows prefectural versions for other towns in 福岡県", () => {
    const ids = programsForArea("福岡県", "その他").map((p) => p.id);
    expect(ids).toContain("fukuoka-pref-koto-shokugyo-kunren");
    expect(ids).not.toContain("jp-koto-shokugyo-kunren-kyufukin");
    expect(ids).toContain("fukuoka-pref-yoikuhi-koseishosho");
    expect(ids).toContain("fukuoka-pref-yoikuhi-hosho");
  });
  it("shows only national programs outside 福岡県", () => {
    const list = programsForArea("その他", "その他");
    expect(list.every((p) => p.level === "national")).toBe(true);
    expect(list.map((p) => p.id)).toContain("jp-koto-shokugyo-kunren-kyufukin");
  });
});
