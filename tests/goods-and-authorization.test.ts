import { describe, expect, it } from "vitest";
import { isOrganizationManagerMembership } from "../lib/roles";
import { availableGoodsQuantity, canReserveGoods } from "../lib/goods-inventory";

describe("goods availability", () => {
  it("never reports negative inventory or allows over-claiming", () => {
    expect(availableGoodsQuantity(5, 2)).toBe(3);
    expect(availableGoodsQuantity(5, 7)).toBe(0);
    expect(canReserveGoods(5, 2, 3)).toBe(true);
    expect(canReserveGoods(5, 2, 4)).toBe(false);
    expect(canReserveGoods(5, 2, 0)).toBe(false);
  });
});

describe("organization authorization", () => {
  it("only recognizes organization management membership roles", () => {
    expect(isOrganizationManagerMembership("ORGANIZATION_REP")).toBe(true);
    expect(isOrganizationManagerMembership("ADMIN")).toBe(true);
    expect(isOrganizationManagerMembership("SUPPORTER")).toBe(false);
  });
});
