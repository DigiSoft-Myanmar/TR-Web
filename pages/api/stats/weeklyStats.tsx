import useAuth from "@/hooks/useAuth";
import prisma from "@/prisma/prisma";
import { Unauthorized } from "@/types/ApiResponseTypes";
import { isInternal } from "@/util/authHelper";
import { Role, SiteVisit } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

async function getStats(startDate: Date, endDate: Date) {
  let usersLogin = await prisma.user.count({
    where: {
      role: {
        in: [Role.Buyer, Role.Trader, Role.Seller],
      },
      lastLogin: {
        gt: startDate,
        lte: endDate,
      },
    },
  });

  let productsClick = await prisma.productView.count({
    where: {
      clickedDate: {
        gte: startDate.toISOString(),
        lte: endDate.toISOString(),
      },
    },
  });

  let mobileUsage = await prisma.siteVisit.findMany({
    where: {
      createdAt: {
        gte: startDate.toISOString(),
        lte: endDate.toISOString(),
      },
      user: {
        role: {
          in: [Role.Buyer, Role.Trader, Role.Seller],
        },
      },
      isMobile: true,
    },
  });

  let webUsage = await prisma.siteVisit.findMany({
    where: {
      createdAt: {
        gte: startDate.toISOString(),
        lte: endDate.toISOString(),
      },
      user: {
        role: {
          in: [Role.Buyer, Role.Trader, Role.Seller],
        },
      },
      isMobile: false,
    },
  });

  return {
    totalVisits:
      getUniqueIpAddressCount(webUsage) + getUniqueIpAddressCount(mobileUsage),
    usersLogin: usersLogin,
    productsClicks: productsClick,
    mobileUsage: getUniqueIpAddressCount(mobileUsage),
    webUsage: getUniqueIpAddressCount(webUsage),
  };
}

function getUniqueIpAddressCount(usage: SiteVisit[]) {
  return usage
    .filter(
      (obj, index, self) =>
        index === self.findIndex((t) => t.ipAddress === obj.ipAddress)
    )
    .map((z) => (z.ipAddress ? z.ipAddress : ""))
    .filter((z) => z).length;
}

async function getActiveStats(date: Date) {
  let sDate = new Date(date);
  let eDate = new Date(date);
  eDate.setHours(23, 59, 59, 999);
  let usage = await prisma.siteVisit.findMany({
    where: {
      createdAt: {
        gte: sDate.toISOString(),
        lte: eDate.toISOString(),
      },
    },
  });
  return usage
    .filter(
      (obj, index, self) =>
        index === self.findIndex((t) => t.ipAddress === obj.ipAddress)
    )
    .map((z) => (z.ipAddress ? z.ipAddress : ""))
    .filter((z) => z).length;
}

async function getPurchasedStats(date: Date) {
  let sDate = new Date(date);
  let eDate = new Date(date);
  eDate.setHours(23, 59, 59, 999);
  let usage = await prisma.siteVisit.findMany({
    where: {
      createdAt: {
        gte: sDate.toISOString(),
        lte: eDate.toISOString(),
      },
      user: {
        role: {
          in: [Role.Buyer, Role.Trader],
        },
      },
    },
  });
  let u = usage
    .filter(
      (obj, index, self) =>
        index === self.findIndex((t) => t.ipAddress === obj.ipAddress)
    )
    .map((z) => (z.userId ? z.userId : ""))
    .filter((z) => z);

  let orders = await prisma.order.findMany({
    where: {
      orderByUserId: {
        in: u,
      },
      createdAt: {
        gte: sDate.toISOString(),
        lte: eDate.toISOString(),
      },
    },
  });

  let uniqueOrder = orders.filter(
    (obj, index, self) =>
      index === self.findIndex((t) => t.orderByUserId === obj.orderByUserId)
  ).length;

  return uniqueOrder;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session: any = await useAuth(req);
  if (isInternal(session)) {
    const today = new Date();

    // Calculate start and end dates of the week
    const endDate = new Date(today);
    endDate.setDate(today.getDate());
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const prevStartDate = new Date(today);
    prevStartDate.setDate(today.getDate() - 13);
    prevStartDate.setHours(0, 0, 0, 0);

    const prevEndDate = new Date(today);
    prevEndDate.setDate(today.getDate() - 7);
    prevEndDate.setHours(23, 59, 59, 999);

    let data = await getStats(startDate, endDate);

    let prevStats = await getStats(prevStartDate, prevEndDate);

    let dateStats = [];
    for (let i = 0; i < 7; i++) {
      let d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      dateStats.push({
        date: d.toISOString(),
        activeStats: await getActiveStats(d),
        purchasedStats: await getPurchasedStats(d),
      });
    }

    return res.status(200).json({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),

      prevStartDate: prevStartDate.toISOString(),
      prevEndDate: prevEndDate.toISOString(),

      currentStats: data,
      prevStats: prevStats,
      dateStats: dateStats,
    });
  } else {
    return res.status(401).json(Unauthorized);
  }
}
