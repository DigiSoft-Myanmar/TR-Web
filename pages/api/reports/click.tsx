import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import { NotAvailable, Unauthorized } from "@/types/ApiResponseTypes";
import { ReportPermission } from "@/types/permissionTypes";
import { isInternal } from "@/util/authHelper";
import { monthDiff } from "@/util/reportHelper";
import { canAccess } from "@/util/roleHelper";
import { ProductType, Role } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useAuth(req);
  let authorize = await canAccess(req, ReportPermission.reportClickViewAllow);
  if (true) {
    switch (req.method) {
      case "GET": {
        let { startDate, endDate, sellerId, brandId } = req.query;

        let today = new Date();

        let endDate1 = new Date(today);
        endDate1.setMonth(today.getMonth() + 1);
        endDate1.setDate(0);
        endDate1.setHours(23, 59, 59, 999);

        let startDate1 = new Date(today);
        startDate1.setMonth(startDate1.getMonth() - 2);
        startDate1.setHours(0, 0, 0, 0);
        startDate1.setDate(1);

        if (startDate) {
          startDate1 = new Date(startDate.toString());
        }
        if (endDate) {
          endDate1 = new Date(endDate.toString());
        }

        let siteVisit = await prisma.siteVisit.findMany({
          where: {
            createdAt: {
              gte: startDate1,
              lte: endDate1,
            },
          },
        });

        let productClicks = await prisma.productView.findMany({
          where: {
            createdAt: {
              gte: startDate1,
              lte: endDate1,
            },
          },
          include: {
            product: true,
          },
        });

        let totalAdsClick = await prisma.adsClick.findMany({
          where: {
            createdAt: {
              gte: startDate1,
              lte: endDate1,
            },
          },
          include: {
            ads: true,
          },
        });

        let month = monthDiff(startDate1, endDate1) + 1;
        let monthStats = [];
        for (let i = 0; i < month; i++) {
          let date = new Date(startDate1);
          date.setMonth(startDate1.getMonth() + i);
          date.setDate(1);

          let eDate = new Date(date);
          eDate.setMonth(date.getMonth() + 1);
          eDate.setHours(23, 59, 59, 999);
          eDate.setDate(0);

          monthStats.push({
            startDate: date,
            endDate: eDate,
            title: date.toLocaleDateString("en-ca", {
              year: "numeric",
              month: "short",
            }),
            adsClick: totalAdsClick.filter(
              (z) =>
                new Date(z.createdAt).getTime() >= date.getTime() &&
                new Date(z.createdAt).getTime() <= eDate.getTime()
            ).length,
            prodClick: productClicks.filter(
              (z) =>
                new Date(z.createdAt).getTime() >= date.getTime() &&
                new Date(z.createdAt).getTime() <= eDate.getTime()
            ).length,
          });
        }

        return res.status(200).json({
          startDate: startDate1.toISOString(),
          endDate: endDate1.toISOString(),
          stats: {
            totalSiteVisits: siteVisit.length,
            totalProductVisits: productClicks.filter(
              (z) =>
                z.product.type === ProductType.Fixed ||
                z.product.type === ProductType.Variable
            ).length,
            totalAuctionVisits: productClicks.filter(
              (z) => z.product.type === ProductType.Auction
            ).length,
            totalAdsClick: totalAdsClick.length,
          },
          monthStats: monthStats,
          adsClick: totalAdsClick,
          prodsClick: productClicks,
        });
      }
      default:
        return res.status(405).json(NotAvailable);
    }
  } else {
    return res.status(401).json(Unauthorized);
  }
}
