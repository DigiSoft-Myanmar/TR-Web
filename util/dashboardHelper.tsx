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

export function checkStatus(cartItem: any, status: OrderStatus) {
  let s =
    cartItem.statusHistory[cartItem.statusHistory.length - 1].status === status;
  return s ? true : false;
}

export function getCount(
  orders: Order[],
  status: OrderStatus,
  isCustomProduct: boolean
) {
  return orders
    .map((z) =>
      z.cartItems
        .map((b: any) =>
          isCustomProduct === false
            ? checkStatus(b, status) && b.isCustomProduct !== true
              ? b.quantity
              : 0
            : checkStatus(b, status) && b.isCustomProduct === true
            ? b.quantity
            : 0
        )
        .reduce((a: number, b: number) => a + b, 0)
    )
    .reduce((a: number, b: number) => a + b, 0);
}
