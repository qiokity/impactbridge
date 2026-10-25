export function availableGoodsQuantity(quantity: number, reservedQuantity: number) {
  return Math.max(0, quantity - reservedQuantity);
}

export function canReserveGoods(quantity: number, reservedQuantity: number, requestedQuantity: number) {
  return Number.isInteger(requestedQuantity) && requestedQuantity > 0 && requestedQuantity <= availableGoodsQuantity(quantity, reservedQuantity);
}
