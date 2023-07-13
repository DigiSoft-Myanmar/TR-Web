import { OrderStatus } from "@/types/orderTypes";
import { Order } from "@prisma/client";

export function calculatePercentage(oldValue: number, newValue: number) {
  return oldValue !== 0
    ? parseInt((((newValue - oldValue) / oldValue) * 100).toFixed(0))
    : 100;
}

export function calculateWidth(currentValue: number, totalValue: number) {
  return totalValue > 0 ? (100 * currentValue) / totalValue : 0;
}

export function checkStatus(sellerResponse: any, status: OrderStatus) {
  let s =
    sellerResponse.statusHistory[sellerResponse.statusHistory.length - 1]
      .status === status;
  return s ? true : false;
}

export function getCount(orders: Order[], status: OrderStatus) {
  return orders
    .map(
      (z) => z.sellerResponse.filter((b: any) => checkStatus(b, status)).length
    )
    .reduce((a, b) => a + b, 0);
}
