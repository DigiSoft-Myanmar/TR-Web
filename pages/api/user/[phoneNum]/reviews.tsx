// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import prisma from "@/prisma/prisma";
import { BadRequest, NotAvailable } from "@/types/ApiResponseTypes";
import { isInternal } from "@/util/authHelper";
import { ReviewType } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let { phoneNum, type } = req.query;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    if (phoneNum && type) {
      switch (req.method) {
        case "GET":
          let user = await prisma.user.findFirst({
            where: {
              phoneNum: phoneNum.toString(),
            },
          });
          if (user) {
            let review: any = type.toString();
            let myReview = undefined;
            if (session) {
              myReview = await prisma.review.findFirst({
                where: {
                  createdByUserId: session.id,
                  reviewType: review,
                  userId: user.id,
                },
                include: {
                  createdBy: true,
                },
              });
            }
            let otherReviews = await prisma.review.findMany({
              where: {
                reviewType: review,
                userId: user.id,
              },
              include: {
                createdBy: true,
              },
            });
            let order = undefined;
            if (session) {
              if (type === ReviewType.Seller) {
                order = await prisma.order.findFirst({
                  where: {
                    orderByUserId: session.id,
                    sellerIds: {
                      has: user.id,
                    },
                  },
                });
              } else {
                order = await prisma.order.findFirst({
                  where: {
                    orderByUserId: user.id,
                    sellerIds: {
                      has: session.id,
                    },
                  },
                });
              }
            }

            return res.status(200).json({
              myReview: myReview,
              otherReviews: otherReviews,
              canReview: order ? true : false,
            });
          } else {
            return res.status(404).json(NotAvailable);
          }
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
