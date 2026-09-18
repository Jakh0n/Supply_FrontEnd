import { Product } from "@/types";

export type StockIssue = "ok" | "unavailable" | "insufficient";

export function getStockIssue(
  product: Product,
  quantity: number,
): StockIssue {
  if (!product.isActive) {
    return "unavailable";
  }

  if (product.amount < quantity) {
    return "insufficient";
  }

  return "ok";
}

export function canFulfillmentEdit(status: string): boolean {
  return status === "pending" || status === "approved";
}
