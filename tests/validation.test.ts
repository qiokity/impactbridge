import { describe, expect, it } from "vitest";
import { communityReportInput, moneySchema, passwordSchema } from "../lib/validation";

describe("server boundary validation", () => {
  it("uses integer paise and rejects unsafe donation values", () => {
    expect(moneySchema.parse("100")).toBe(100);
    expect(() => moneySchema.parse("100.5")).toThrow();
    expect(() => moneySchema.parse("0")).toThrow();
  });

  it("requires a robust password and bounded community severity", () => {
    expect(() => passwordSchema.parse("short")).toThrow();
    expect(communityReportInput.parse({ title: "Broken light", description: "The light is not working after sunset.", category: "Broken streetlight", severity: "4", approximateArea: "Ward 5" }).severity).toBe(4);
    expect(() => communityReportInput.parse({ title: "Broken light", description: "The light is not working after sunset.", category: "Broken streetlight", severity: "6", approximateArea: "Ward 5" })).toThrow();
  });
});
