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
import { isBuyer, isInternal, isSeller } from "@/util/authHelper";
import { ProductType, ReviewType, Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let { phoneNum } = req.query;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (phoneNum) {
      switch (req.method) {
        case "GET":
          let stats = {
            buyerReview: 0,
            sellerReview: 0,
            noOfProducts: 0,
            noOfAuctions: 0,
            noOfUnitSold: 0,
            buyerTotalReview: 0,
            sellerTotalReview: 0,
            lastOnlineTime: undefined,
          };
          let user = await prisma.user.findFirst({
            where: {
              phoneNum: phoneNum.toString(),
            },
          });
          if (user) {
            if (isBuyer(user)) {
              let buyerReviews = await prisma.review.findMany({
                where: {
                  userId: user.id,
                  reviewType: ReviewType.Buyer,
                },
              });
              stats.buyerReview = buyerReviews
                .map((b) => b.rating)
                .reduce((a, b) => a + b, 0);
              stats.buyerTotalReview = buyerReviews.length;
            }
            if (isSeller(user)) {
              let prodCount = await prisma.product.count({
                where: {
                  isPublished: true,
                  sellerId: user.id,
                  type: {
                    in: [ProductType.Fixed, ProductType.Variable],
                  },
                },
              });
              let auctionCount = await prisma.product.count({
                where: {
                  isPublished: true,
                  sellerId: user.id,
                  type: {
                    in: [ProductType.Fixed, ProductType.Variable],
                  },
                },
              });
              let unitSold = await prisma.unitSold.findMany({
                where: {
                  product: {
                    sellerId: user.id,
                  },
                },
              });
              stats.noOfProducts = prodCount;
              stats.noOfAuctions = auctionCount;
              stats.noOfUnitSold = unitSold
                .map((z) => z.soldUnit)
                .reduce((a, b) => a + b, 0);

              let sellerReviews = await prisma.review.findMany({
                where: {
                  userId: user.id,
                  reviewType: ReviewType.Seller,
                },
              });
              stats.sellerReview = sellerReviews
                .map((b) => b.rating)
                .reduce((a, b) => a + b, 0);
              stats.sellerTotalReview = sellerReviews.length;
            }
            if (user.lastOnlineTime) {
              stats.lastOnlineTime = new Date(
                user.lastOnlineTime
              ).toISOString();
            }

            return res.status(200).json(stats);
          } else {
            return res.status(404).json(NotAvailable);
          }
        case "PUT":
          const session = await useAuth(req);
          let body = JSON.parse(req.body);
          if (body.lastOnlineTime) {
            await prisma.user.update({
              where: {
                id: body.id,
              },
              data: {
                lastOnlineTime: new Date(body.lastOnlineTime),
              },
            });
          } else {
            await prisma.user.update({
              where: {
                id: body.id,
              },
              data: {
                lastOnlineTime: {
                  unset: true,
                },
              },
            });
          }
          return res.status(200).json(Success);

        default:
          return res.status(501).json(NotAvailable);
      }
    } else {
      return res.status(400).json(BadRequest);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
