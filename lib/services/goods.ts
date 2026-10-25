import "server-only";
import { db } from "@/lib/db";

export async function acceptGoodsClaim(claimId: string, ownerId: string) {
  return db().$transaction(async (tx) => {
    const claim = await tx.goodsClaim.findFirst({ where: { id: claimId, status: "PENDING" }, include: { listing: true } });
    if (!claim || claim.listing.ownerId !== ownerId) throw new Error("You cannot accept this claim.");
    const updated = await tx.goodsListing.updateMany({ where: { id: claim.listingId, ownerId, status: "AVAILABLE", quantity: { gte: claim.listing.reservedQuantity + claim.quantity } }, data: { reservedQuantity: { increment: claim.quantity } } });
    if (!updated.count) throw new Error("There is no longer enough quantity available.");
    const accepted = await tx.goodsClaim.update({ where: { id: claimId }, data: { status: "ACCEPTED" } });
    await tx.goodsFulfillment.create({ data: { claimId } });
    return accepted;
  });
}

export async function completeGoodsFulfillment(claimId: string, actorId: string, actor: "donor" | "claimant") {
  return db().$transaction(async (tx) => {
    const claim = await tx.goodsClaim.findUnique({ where: { id: claimId }, include: { listing: true, fulfillment: true } });
    if (!claim?.fulfillment || claim.status !== "ACCEPTED") throw new Error("This claim is not ready for fulfillment.");
    if (actor === "donor" && claim.listing.ownerId !== actorId) throw new Error("Not authorized.");
    if (actor === "claimant" && claim.claimantId !== actorId) throw new Error("Not authorized.");
    const fulfillment = await tx.goodsFulfillment.update({ where: { claimId }, data: actor === "donor" ? { donorConfirmedAt: new Date() } : { claimantConfirmedAt: new Date() } });
    if (fulfillment.donorConfirmedAt && fulfillment.claimantConfirmedAt) {
      await tx.goodsClaim.update({ where: { id: claimId }, data: { status: "FULFILLED" } });
      await tx.goodsListing.update({ where: { id: claim.listingId }, data: { reservedQuantity: { decrement: claim.quantity }, quantity: { decrement: claim.quantity }, status: claim.listing.quantity === claim.quantity ? "FULFILLED" : "AVAILABLE" } });
    }
    return fulfillment;
  });
}
