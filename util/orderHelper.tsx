import { CartItem } from "@/prisma/models/cartItems";
import { OrderStatus } from "@/types/orderTypes";
import {
  Brand,
  Product,
  ProductType,
  PromoCode,
  StockType,
  User,
} from "@prisma/client";
import { sortBy } from "lodash";

export function isCompleted(sellerResponse: any, sellerId: string) {
  return sellerResponse
    .find((z) => z.sellerId === sellerId)
    ?.statusHistory.find((z) => z.status === OrderStatus.Shipped);
}

export function getOrderStatus(data: any, sellerId?: string) {
  let sellerResponse = data.sellerResponse;

  if (sellerId) {
    let responseData = sellerResponse
      .filter((e: any) => e.sellerId === sellerId)
      ?.map(
        (b) =>
          sortBy(b.statusHistory, (obj: any) => obj.updatedDate).reverse()[0]
      );
    return responseData[0];
  } else {
    let responseData = sellerResponse.map(
      (b) =>
        sortBy(b.statusHistory, (obj: any) => obj.updatedDate).reverse()[0]
          .status
    );
    if (Array.from(new Set(responseData)).length === 1) {
      return responseData[0];
    } else if (
      responseData.every(
        (b) => b === OrderStatus.Shipped || b === OrderStatus.Rejected
      )
    ) {
      return OrderStatus.Completed;
    } else {
      return OrderStatus.Processing;
    }
  }
}

export function getValidCartItems(
  cartItems: CartItem[],
  sellerStatus: OrderStatus
) {
  switch (sellerStatus) {
    case OrderStatus.AutoCancelled:
    case OrderStatus.Rejected:
      return [];
    default:
      return cartItems;
  }
}

export function isCartValid(sellerResponse: any) {
  let status = sortBy(
    sellerResponse.statusHistory,
    (obj: any) => obj.updatedDate
  ).reverse()[0].status;
  switch (status) {
    case OrderStatus.AutoCancelled:
    case OrderStatus.Rejected:
      return false;
    default:
      return true;
  }
}

export function getCartItems(cartItems: any[], sellerResponse: any[]) {
  let c: any = [];
  for (let i = 0; i < sellerResponse.length; i++) {
    let status = sortBy(
      sellerResponse[i].statusHistory,
      (obj: any) => obj.updatedDate
    ).reverse()[0].status;
    let d = getValidCartItems(
      cartItems.filter((e) => e.sellerId === sellerResponse[i].sellerId),
      status
    );
    c = [...c, ...d];
  }
  return c;
}

export function getTotal(cartItems: CartItem[], sellerId?: string) {
  if (sellerId) {
    return cartItems
      .filter((e) => e.sellerId === sellerId)
      .map((e) =>
        e.salePrice ? e.salePrice * e.quantity : e.normalPrice * e.quantity
      )
      .reduce((a, b) => a + b, 0);
  } else {
    return cartItems
      .map((e) =>
        e.salePrice ? e.salePrice * e.quantity : e.normalPrice * e.quantity
      )
      .reduce((a, b) => a + b, 0);
  }
}

export function getDiscountTotal(discountTotal?: any[], sellerId?: string) {
  if (discountTotal && discountTotal.length > 0) {
    if (
      sellerId &&
      discountTotal.find((b) => b.sellerId === sellerId)?.discount
    ) {
      return discountTotal.find((b) => b.sellerId === sellerId)?.discount;
    } else if (sellerId) {
      return 0;
    } else {
      return discountTotal.map((b) => b.discount).reduce((a, b) => a + b, 0);
    }
  }
  return 0;
}

export function getShippingTotal(sellerResponse: any[], sellerId?: string) {
  return sellerResponse
    .filter(
      (e: any) => (sellerId ? e.sellerId === sellerId : true) && isCartValid(e)
    )
    .map((e: any) => (e.shippingFee ? e.shippingFee : 0))
    .reduce((a: number, b: number) => a + b, 0);
}

export function getStock(product: Product) {
  if (product.type === ProductType.Fixed) {
    if (product.stockType === StockType.InStock) {
      return Infinity;
    } else if (product.stockType === StockType.OutOfStock) {
      return 0;
    } else if (product.stockType === StockType.StockLevel) {
      return product.stockLevel;
    }
  } else {
    let variationStock = product.variations.map((e: any) => e.stockType);
    if (variationStock.find((e) => e === StockType.InStock)) {
      return Infinity;
    } else if (variationStock.find((e) => e === StockType.StockLevel)) {
      let stockLevel: number[] = product.variations.map((e: any) =>
        e.stockLevel ? e.stockLevel : 0
      );
      return Math.max(...stockLevel);
    } else if (variationStock.find((e) => e === StockType.OutOfStock)) {
      return 0;
    }
  }
}

export function getSubTotal(order: any, sellerId?: string) {
  if (sellerId) {
    return order.cartItems
      .filter(
        (b: any) =>
          isCartValid(
            order.sellerResponse.find((e: any) => e.sellerId === b.sellerId)
          ) && b.sellerId === sellerId
      )
      .map((z: CartItem) =>
        z.salePrice ? z.salePrice * z.quantity : z.normalPrice * z.quantity
      )
      .reduce((a, b) => a + b, 0);
  } else {
    return order.cartItems
      .map((z: CartItem) =>
        isCartValid(
          order.sellerResponse.find((e: any) => e.sellerId === z.sellerId)
        )
          ? z.salePrice
            ? z.salePrice * z.quantity
            : z.normalPrice * z.quantity
          : 0
      )
      .reduce((a, b) => a + b, 0);
  }
}

export function getShippingFeeTotal(order: any) {
  return order.sellerResponse
    .map((z: any) =>
      z.shippingFee && z.isFreeShipping === false
        ? isCartValid(
            order.sellerResponse.find((e: any) => e.sellerId === z.sellerId)
          )
          ? z.shippingFee
          : 0
        : 0
    )
    .reduce((a, b) => a + b, 0);
}

export function getPromoTotal(order: any) {
  return order.discountTotal
    .map((z: any) => z.discount)
    .reduce((a, b) => a + b, 0);
}

export function getPriceTotal(order: any) {
  return getSubTotal(order) + getShippingFeeTotal(order) - getPromoTotal(order);
}
