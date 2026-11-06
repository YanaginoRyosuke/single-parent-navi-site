import { describe, expect, it } from "vitest";
import { decodeProfile, encodeProfile } from "@/lib/profile-codec";
import type { Profile } from "@/lib/types";

describe("profile codec", () => {
  it("round-trips a profile through the hash string", () => {
    const p: Profile = {
      residence: { pref: "福岡県", city: "北九州市" },
      parentKind: "father",
      children: [{ age: 2 }, { age: 7 }],
      incomeBand: "lt300",
      housing: "public",
      employment: "fulltime",
      flags: ["wantsQualification"],
    };
    const s = encodeProfile(p);
    expect(decodeProfile(new URLSearchParams(s))).toEqual(p);
  });

  it("returns null for incomplete input", () => {
    expect(decodeProfile(new URLSearchParams("a=fukuoka-shi"))).toBeNull();
  });
});
