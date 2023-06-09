import { CartItem } from "@/prisma/models/cartItems";
import { OrderStatus } from "@/types/orderTypes";
import {
  Brand,
  Product,
  ProductType,
  PromoCode,
  StockType,
} from "@prisma/client";
import { sortBy } from "lodash";

export function getOrderStatus(data: any, brandName?: string) {
  console.log(data);
  if (brandName) {
    return sortBy(
      data.find((e: any) => e.brand === brandName),
      (obj: any) => obj.updatedDate,
    ).reverse()[0].status;
  } else {
    return sortBy(data, (obj: any) => obj.updatedDate).reverse()[0].status;
  }
}

export function getValidCartItems(
  cartItems: CartItem[],
  sellerStatus: OrderStatus,
) {
  switch (sellerStatus) {
    case OrderStatus.Cancelled:
    case OrderStatus.Refund:
    case OrderStatus.Rejected:
      return [];
    default:
      return cartItems;
  }
}

export function isCartValid(sellerResponse: any) {
  let status = sortBy(
    sellerResponse.statusHistory,
    (obj: any) => obj.updatedDate,
  ).reverse()[0].status;
  switch (status) {
    case OrderStatus.Cancelled:
    case OrderStatus.Refund:
    case OrderStatus.Rejected:
      return false;
    default:
      return true;
  }
}

export function getCartItems(cartItems: CartItem[], sellerResponse: any[]) {
  let c: any = [];
  for (let i = 0; i < sellerResponse.length; i++) {
    let status = sortBy(
      sellerResponse[i].statusHistory,
      (obj: any) => obj.updatedDate,
    ).reverse()[0].status;
    let d = getValidCartItems(
      cartItems.filter((e) => e.brandId === sellerResponse[i].brandId),
      status,
    );
    c = [...c, ...d];
  }
  return c;
}

export function getTotal(cartItems: CartItem[], brandId?: string) {
  if (brandId) {
    return cartItems
      .filter((e) => e.brandId === brandId)
      .map((e) =>
        e.salePrice ? e.salePrice * e.quantity : e.normalPrice * e.quantity,
      )
      .reduce((a, b) => a + b, 0);
  } else {
    return cartItems
      .map((e) =>
        e.salePrice ? e.salePrice * e.quantity : e.normalPrice * e.quantity,
      )
      .reduce((a, b) => a + b, 0);
  }
}

export function getDiscountTotal(
  cartItems: CartItem[],
  brandList: Brand[],
  promoCode?: PromoCode,
  brandId?: string,
) {
  if (promoCode) {
    if (promoCode.isPercent === true) {
      return (
        (cartItems
          .filter((e: any) => (brandId ? e.brandId === brandId : true))
          .map((e: any) =>
            e.salePrice ? e.salePrice * e.quantity : e.normalPrice * e.quantity,
          )
          .reduce((a: number, b: number) => a + b, 0) *
          promoCode.discount) /
        100
      );
    } else {
      if (brandId) {
        return promoCode.discount / brandList.length;
      } else {
        return promoCode.discount;
      }
    }
  }
  return 0;
}

export function getShippingTotal(sellerResponse: any[], brandId?: string) {
  return sellerResponse
    .filter(
      (e: any) => (brandId ? e.brandId === brandId : true) && isCartValid(e),
    )
    .map((e: any) => (e.shippingFee ? e.shippingFee : 0))
    .reduce((a: number, b: number) => a + b, 0);
}

export function getAvgPointUsage(pointUsage: number, brandList: Brand[]) {
  return pointUsage / brandList.length;
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
        e.stockLevel ? e.stockLevel : 0,
      );
      return Math.max(...stockLevel);
    } else if (variationStock.find((e) => e === StockType.OutOfStock)) {
      return 0;
    }
  }
}
