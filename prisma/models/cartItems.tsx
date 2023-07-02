import { BillingAddress, ShippingAddress } from "@/context/MarketplaceContext";
import { DeliveryType } from "@/types/orderTypes";
import prisma from "../prisma";

export type CartItem = {
  productId: string;
  variation?: any;
  quantity: number;
  normalPrice: number;
  salePrice: number;
  sellerId: string;
  SKU?: string;
  createdAt?: Date;
  isAuction?: Boolean;
  auctionId?: string;
};

export type ShippingFee = {
  sellerId: string;
  isFreeShipping: boolean;
  deliveryType: DeliveryType;
  shippingFee?: number;
};

export const getCartItems = async (userId: string) => {
  const cartItems = await prisma.cartItems.findFirst({
    where: { userId: userId },
  });
  return cartItems;
};

export const updateCartItem = async (
  userId: string,
  cartItems: any[],
  billingAddress: BillingAddress,
  shippingAddress: ShippingAddress,
  isAddressDiff: boolean
) => {
  const cartItem = await prisma.cartItems.upsert({
    where: { userId: userId },
    update: {
      cartItems: cartItems,
    },
    create: {
      userId: userId,
      cartItems: cartItems,
      billingAddress: billingAddress,
      shippingAddress: shippingAddress,
      isAddressDiff: isAddressDiff,
    },
  });
  return cartItem;
};
