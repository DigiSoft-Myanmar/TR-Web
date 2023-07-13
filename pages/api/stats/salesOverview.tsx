import useAuth from "@/hooks/useAuth";
import prisma from "@/prisma/prisma";
import { Unauthorized } from "@/types/ApiResponseTypes";
import { OrderStatus } from "@/types/orderTypes";
import { checkExpire } from "@/util/adsHelper";
import { isInternal } from "@/util/authHelper";
import { getCount } from "@/util/dashboardHelper";
import { ProductType, Role, StockType } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

async function getStats(startDate: Date, endDate: Date) {
  let activeDate = new Date();
  activeDate.setMonth(activeDate.getMonth() - 3);

  let totalBuyers = await prisma.user.count({
    where: {
      isBlocked: false,
      isDeleted: false,
      role: Role.Buyer,
    },
  });

  let totalActiveBuyers = await prisma.user.count({
    where: {
      isBlocked: false,
      isDeleted: false,
      role: Role.Buyer,
      lastLogin: {
        gte: activeDate,
      },
    },
  });

  let totalSellers = await prisma.user.count({
    where: {
      isBlocked: false,
      isDeleted: false,
      role: Role.Seller,
    },
  });

  let totalExpiredSellers = await prisma.user.findMany({
    where: {
      isBlocked: false,
      isDeleted: false,
      role: Role.Seller,
      memberStartDate: {
        isSet: true,
      },
    },
    include: {
      currentMembership: true,
    },
  });

  let totalActiveSellers = await prisma.user.count({
    where: {
      isBlocked: false,
      isDeleted: false,
      role: Role.Seller,
      lastLogin: {
        gte: activeDate,
      },
    },
  });

  let totalExpiredSellersCount = totalExpiredSellers.filter((z) => {
    let date = new Date(z.memberStartDate);
    date.setDate(date.getDate() + z.currentMembership.validity);
    if (date.getTime() < new Date().getTime()) {
      return true;
    } else {
      return false;
    }
  }).length;

  let totalTraders = await prisma.user.count({
    where: {
      isBlocked: false,
      isDeleted: false,
      role: Role.Trader,
    },
  });

  let totalExpiredTraders = await prisma.user.findMany({
    where: {
      isBlocked: false,
      isDeleted: false,
      role: Role.Trader,
      memberStartDate: {
        isSet: true,
      },
    },
    include: {
      currentMembership: true,
    },
  });

  let totalActiveTraders = await prisma.user.count({
    where: {
      isBlocked: false,
      isDeleted: false,
      role: Role.Trader,
      lastLogin: {
        gte: activeDate,
      },
    },
  });

  let totalExpiredTradersCount = totalExpiredTraders.filter((z) => {
    let date = new Date(z.memberStartDate);
    date.setDate(date.getDate() + z.currentMembership.validity);
    if (date.getTime() < new Date().getTime()) {
      return true;
    } else {
      return false;
    }
  }).length;

  let totalAds = await prisma.ads.count({});
  let ads = await prisma.ads.findMany({
    where: {
      adsLocations: {
        isEmpty: false,
      },
    },
    include: {
      seller: {
        include: {
          currentMembership: true,
        },
      },
    },
  });

  let totalOrders = await prisma.order.findMany({});

  let totalProducts = await prisma.product.count({});
  let totalAuctions = await prisma.product.count({
    where: {
      type: ProductType.Auction,
    },
  });
  let totalBuyProducts = await prisma.product.findMany({
    where: {
      type: {
        in: [ProductType.Fixed, ProductType.Variable],
      },
    },
  });

  let conf = await prisma.configuration.findFirst({});

  return {
    totalBuyers: totalBuyers,
    totalActiveBuyers: totalActiveBuyers,
    totalInactiveBuyers: totalBuyers - totalActiveBuyers,
    totalSellers: totalSellers,
    totalExpiredSellers: totalExpiredSellersCount,
    totalActiveSellers: totalActiveSellers,
    totalInactiveSellers:
      totalSellers - (totalExpiredSellersCount + totalActiveSellers) > 0
        ? totalSellers - (totalExpiredSellersCount + totalActiveSellers)
        : 0,

    totalTraders: totalTraders,
    totalExpiredTraders: totalExpiredTradersCount,
    totalActiveTraders: totalActiveTraders,
    totalInactiveTraders:
      totalTraders - (totalExpiredTradersCount + totalActiveTraders) > 0
        ? totalTraders - (totalExpiredTradersCount + totalActiveTraders)
        : 0,

    totalAds: totalAds,
    totalAdsPlaced:
      ads.length -
      ads.filter(
        (z) =>
          z.adsLocations.filter((b) =>
            checkExpire(b, z.seller.currentMembership, true)
          ).length > 0
      ).length,
    totalAdsNearExpired: ads.filter(
      (z) =>
        z.adsLocations.filter((b) => checkExpire(b, z.seller.currentMembership))
          .length > 0
    ).length,
    totalAdsExpired: ads.filter(
      (z) =>
        z.adsLocations.filter((b) =>
          checkExpire(b, z.seller.currentMembership, true)
        ).length > 0
    ).length,
    totalAdsNotPlaced:
      totalAds -
      ads.filter(
        (z) =>
          z.adsLocations.filter((b) =>
            checkExpire(b, z.seller.currentMembership, true)
          ).length > 0
      ).length,

    totalOrders: totalOrders.length,
    totalOrderReceivedOrders: getCount(totalOrders, OrderStatus.OrderReceived),
    totalAcceptOrders: getCount(totalOrders, OrderStatus.Accepted),
    totalShippedOrders: getCount(totalOrders, OrderStatus.Shipped),
    totalRejectedOrders: getCount(totalOrders, OrderStatus.Rejected),
    totalAutoCancelledOrders: getCount(totalOrders, OrderStatus.AutoCancelled),

    totalProducts: totalProducts,
    totalAuctions: totalAuctions,
    totalInStockProducts: totalBuyProducts.filter((z) => {
      if (z.type === ProductType.Fixed) {
        return (
          z.stockType === StockType.InStock ||
          (z.stockType === StockType.StockLevel &&
            z.stockLevel >= conf.lowStockLimit)
        );
      } else {
        return z.variations.find(
          (b: any) =>
            b.stockType === StockType.InStock ||
            (b.stockType === StockType.StockLevel &&
              b.stockLevel >= conf.lowStockLimit)
        );
      }
    }).length,
    totalOutOfStockProducts: totalBuyProducts.filter((z) => {
      if (z.type === ProductType.Fixed) {
        return (
          z.stockType === StockType.OutOfStock ||
          (z.stockType === StockType.StockLevel && z.stockLevel <= 0)
        );
      } else {
        return z.variations.find(
          (b: any) =>
            b.stockType === StockType.OutOfStock ||
            (b.stockType === StockType.StockLevel && b.stockLevel <= 0)
        );
      }
    }).length,
    totalLowStockProducts: totalBuyProducts.filter((z) => {
      if (z.type === ProductType.Fixed) {
        return (
          z.stockType === StockType.StockLevel &&
          z.stockLevel <= conf.lowStockLimit &&
          z.stockLevel > 0
        );
      } else {
        return z.variations.find(
          (b: any) =>
            b.stockType === StockType.StockLevel &&
            b.stockLevel <= conf.lowStockLimit &&
            b.stockLevel > 0
        );
      }
    }).length,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session: any = await useAuth(req);
  if (isInternal(session)) {
    const startDate = new Date(new Date().getFullYear(), 0, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(new Date().getFullYear(), 11, 31);
    endDate.setHours(23, 59, 59, 999);

    let data = await getStats(startDate, endDate);
    /* 
    const prevStartDate = new Date(new Date().getFullYear() - 1, 0, 1);
    prevStartDate.setHours(0, 0, 0, 0);

    const prevEndDate = new Date(new Date().getFullYear() - 1, 11, 31);
    prevEndDate.setHours(23, 59, 59, 999);
    const prevStats = await getStats(prevStartDate, prevEndDate); */

    return res.status(200).json({
      ...data,
    });
  } else {
    return res.status(401).json(Unauthorized);
  }
}
