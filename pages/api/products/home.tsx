// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import { createTerm, deleteTerm, updateTerm } from "@/prisma/models/product";
import prisma from "@/prisma/prisma";
import {
  AlreadyExists,
  BadRequest,
  Exists,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { isInternal } from "@/util/authHelper";
import { ProductType, Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    switch (req.method) {
      case "GET":
        const today = new Date();

        const prodList = await prisma.product.findMany({
          where: {
            isFeatured: true,
            isPublished: true,
            type: {
              not: ProductType.Auction,
            },

            seller: {
              sellAllow: true,
              isBlocked: false,
              isDeleted: false,
            },
          },
          include: {
            Brand: true,
            Review: true,
            seller: true,
          },
        });

        const auctionProd = await prisma.product.findMany({
          where: {
            type: ProductType.Auction,
            endTime: {
              gt: today,
            },
            seller: {
              sellAllow: true,
              isBlocked: false,
              isDeleted: false,
            },
            isPublished: true,
          },

          include: {
            Brand: true,
            Review: true,
            seller: true,
          },
        });

        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        console.log(currentDate);
        const promotionProducts = await prisma.product.findMany({
          where: {
            OR: [
              {
                isPromotionAll: true,
                isPromotionAllPeriod: true,
              },
              {
                isPromotionAll: true,
                isPromotionAllPeriod: false,
                isPromotionAllStartDate: {
                  lte: currentDate,
                },
                isPromotionAllEndDate: {
                  gte: currentDate,
                },
              },
            ],
            isPublished: true,
            seller: {
              sellAllow: true,
              isBlocked: false,
              isDeleted: false,
            },
          },
          include: {
            Brand: true,
            Review: true,
            seller: true,
          },
        });

        return res.status(200).json({
          buyNow: prodList,
          auctionProd: auctionProd,
          promotionProducts: promotionProducts,
        });
      default:
        return res.status(501).json(NotAvailable);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
