import useAuth from "@/hooks/useAuth";
import prisma from "@/prisma/prisma";
import { Unauthorized } from "@/types/ApiResponseTypes";
import { isInternal } from "@/util/authHelper";
import { isCompleted } from "@/util/orderHelper";
import { NextApiRequest, NextApiResponse } from "next";
import { abort } from "process";

async function getBestStats(startDate: Date, endDate: Date) {
  let orders = await prisma.order.findMany({
    where: {
      createdAt: {
        lte: endDate,
        gt: startDate,
      },
    },
  });

  for (let k = 0; k < orders.length; k++) {
    for (let i = 0; i < orders[k].cartItems.length; i++) {
      let c: any = orders[k].cartItems[i];
      let prod = await prisma.product.findFirst({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          id: c.productId,
        },
      });
      if (prod) {
        c.productInfo = prod;
        let bidCount = await prisma.auctions.count({
          where: {
            productId: prod.id,
            SKU: c.SKU,
          },
        });
        c.bidCount = bidCount;
      }
    }
  }

  let d: any = orders.map((z) =>
    z.cartItems.map((b: any) =>
      isCompleted(z.sellerResponse, b.sellerId)
        ? {
            sellerId: b.sellerId,
            productInfo: b.productInfo,
            productId: b.productId,
            quantity: b.quantity,
            orderByUserId: z.orderByUserId,
            isAuction: b.isAuction,
            bidCount: b.bidCount,
            SKU: b.SKU,
            totalProfit: b.salePrice
              ? b.salePrice * b.quantity
              : b.normalPrice * b.quantity,
          }
        : undefined
    )
  );

  d = [].concat(...d);
  d = d.filter((b: any) => b);

  const result = Object.values(
    d.reduce(
      (acc: any, { productId, quantity, orderByUserId, totalProfit }: any) => {
        if (!acc[productId]) {
          acc[productId] = {
            productId,
            quantity: 0,
            totalProfit,
          };
        }
        acc[productId].quantity += quantity;
        acc[productId].totalProfit += totalProfit;
        return acc;
      },
      {}
    )
  );

  const sellerResult = Object.values(
    d.reduce(
      (
        acc: any,
        { productId, quantity, orderByUserId, totalProfit, sellerId }: any
      ) => {
        if (!acc[sellerId]) {
          acc[sellerId] = {
            quantity: 0,
            sellerId,
            totalProfit,
          };
        }
        acc[sellerId].quantity += quantity;
        acc[sellerId].totalProfit += totalProfit;
        return acc;
      },
      {}
    )
  );

  const buyerResult = Object.values(
    d.reduce(
      (acc: any, { productId, quantity, orderByUserId, totalProfit }: any) => {
        if (!acc[orderByUserId]) {
          acc[orderByUserId] = {
            quantity: 0,
            orderByUserId,
            totalProfit,
          };
        }
        acc[orderByUserId].quantity += quantity;
        acc[orderByUserId].totalProfit += totalProfit;
        return acc;
      },
      {}
    )
  );

  const auctionResult = Object.values(
    d.reduce(
      (
        acc: any,
        {
          productId,
          quantity,
          orderByUserId,
          totalProfit,
          isAuction,
          bidCount,
          SKU,
        }: any
      ) => {
        if (
          (!acc[productId] && isAuction === true) ||
          (acc[productId] && acc[productId].SKU !== SKU)
        ) {
          acc[productId] = {
            productId,
            quantity: 0,
            totalProfit,
            SKU: SKU,
          };
        }
        if (acc[productId]) {
          acc[productId].quantity += bidCount;
          acc[productId].totalProfit += totalProfit;
        }
        return acc;
      },
      {}
    )
  );

  const sortedByQuantity = [
    ...result.sort((a: any, b: any) => b.quantity - a.quantity),
  ];
  const sortedByTotalProfit = [
    ...result.sort((a: any, b: any) => b.totalProfit - a.totalProfit),
  ];

  const sortByBuyerQty = [
    ...buyerResult.sort((a: any, b: any) => b.quantity - a.quantity),
  ];

  const sortByBuyerProfit = [
    ...buyerResult.sort((a: any, b: any) => b.totalProfit - a.totalProfit),
  ];

  const sortBySellerQty = [
    ...sellerResult.sort((a: any, b: any) => b.quantity - a.quantity),
  ];

  const sortBySellerProfit = [
    ...sellerResult.sort((a: any, b: any) => b.totalProfit - a.totalProfit),
  ];

  const sortByAuctionQty = [
    ...auctionResult.sort((a: any, b: any) => b.quantity - a.quantity),
  ];

  const sortByAuctionProfit = [
    ...auctionResult.sort((a: any, b: any) => b.totalProfit - a.totalProfit),
  ];

  let bestProdByUnit: any = undefined;
  let bestProdByProfit = undefined;
  let bestBuyerByUnit = undefined;
  let bestBuyerByProfit = undefined;
  let bestSellerByUnit = undefined;
  let bestSellerByProfit = undefined;
  let bestAuctionByUnit = undefined;
  let bestAuctionByAmount = undefined;

  if (sortedByQuantity.length > 0) {
    let b: any = sortedByQuantity[0];
    let z: any = d.find((z: any) => z.productId === b.productId);

    bestProdByUnit = {
      productInfo: z.productInfo,
      units: b.quantity,
      totalProfit: b.totalProfit,
    };
  }
  if (sortedByTotalProfit.length > 0) {
    let b: any = sortedByTotalProfit[0];
    let z: any = d.find((z: any) => z.productId === b.productId);

    bestProdByProfit = {
      productInfo: z.productInfo,
      units: b.quantity,
      totalProfit: b.totalProfit,
    };
  }
  if (sortByBuyerQty.length > 0) {
    let b: any = sortByBuyerQty[0];
    let user = await prisma.user.findFirst({
      where: {
        id: b.orderByUserId,
      },
    });
    if (user) {
      bestBuyerByUnit = {
        userInfo: user,
        units: b.quantity,
        totalProfit: b.totalProfit,
      };
    }
  }
  if (sortByBuyerProfit.length > 0) {
    let b: any = sortByBuyerProfit[0];
    let user = await prisma.user.findFirst({
      where: {
        id: b.orderByUserId,
      },
    });
    if (user) {
      bestBuyerByProfit = {
        userInfo: user,
        units: b.quantity,
        totalProfit: b.totalProfit,
      };
    }
  }
  if (sortBySellerProfit.length > 0) {
    let b: any = sortBySellerProfit[0];
    let user = await prisma.user.findFirst({
      where: {
        id: b.sellerId,
      },
    });
    if (user) {
      bestSellerByProfit = {
        userInfo: user,
        units: b.quantity,
        totalProfit: b.totalProfit,
      };
    }
  }
  if (sortBySellerQty.length > 0) {
    let b: any = sortBySellerQty[0];
    let user = await prisma.user.findFirst({
      where: {
        id: b.sellerId,
      },
    });
    if (user) {
      bestSellerByUnit = {
        userInfo: user,
        units: b.quantity,
        totalProfit: b.totalProfit,
      };
    }
  }
  if (sortByAuctionProfit.length > 0) {
    let b: any = sortByAuctionProfit[0];
    let z = d.find((z: any) => z.productId === b.productId);

    bestAuctionByAmount = {
      productInfo: z.productInfo,
      units: b.quantity,
      totalProfit: b.totalProfit,
      SKU: z.SKU,
    };
  }
  if (sortByAuctionProfit.length > 0) {
    let b: any = sortByAuctionQty[0];
    let z = d.find((z: any) => z.productId === b.productId);

    bestAuctionByUnit = {
      productInfo: z.productInfo,
      SKU: z.SKU,
      units: b.quantity,
      totalProfit: b.totalProfit,
    };
  }

  return {
    bestProdByUnit: bestProdByUnit,
    bestProdByProfit: bestProdByProfit,
    bestBuyerByUnit: bestBuyerByUnit,
    bestBuyerByProfit: bestBuyerByProfit,
    bestSellerByUnit: bestSellerByUnit,
    bestSellerByProfit: bestSellerByProfit,
    bestAuctionByAmount: bestAuctionByAmount,
    bestAuctionByUnit: bestAuctionByUnit,

    sortByAuctionProfit,
    sortByAuctionQty,
    sortByBuyerProfit,
    sortByBuyerQty,
    sortBySellerProfit,
    sortBySellerQty,
    sortedByTotalProfit,
    sortedByQuantity,
    d,
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

    let data = await getBestStats(startDate, endDate);

    return res.status(200).json({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      ...data,
    });
  } else {
    return res.status(401).json(Unauthorized);
  }
}
