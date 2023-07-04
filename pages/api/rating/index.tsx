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
import { ProductType, Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    const { userId, productId, reviewId } = req.query;

    if (session) {
      switch (req.method) {
        case "POST":
          if (userId || productId) {
            let body = JSON.parse(req.body);
            if (userId) {
              await prisma.review.create({
                data: {
                  rating: body.rating,
                  createdByUserId: session.id,
                  message: body.message,
                  userId: userId?.toString(),
                  reviewType: body.reviewType,
                },
              });
            } else if (productId) {
              await prisma.review.create({
                data: {
                  rating: body.rating,
                  createdByUserId: session.id,
                  message: body.message,
                  productId: productId?.toString(),
                  reviewType: body.reviewType,
                },
              });
            }
            return res.status(200).json(Success);
          } else {
            return res.status(400).json(BadRequest);
          }
        case "PUT":
          if (reviewId) {
            let body = JSON.parse(req.body);
            await prisma.review.update({
              where: {
                id: reviewId.toString(),
              },
              data: {
                rating: body.rating,
                createdByUserId: session.id,
                message: body.message,
                userId: userId?.toString(),
                productId: productId?.toString(),
              },
            });
          } else {
            return res.status(400).json(BadRequest);
          }
        default:
          return res.status(501).json(NotAvailable);
      }
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
