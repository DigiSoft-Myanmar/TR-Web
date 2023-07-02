// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import { CartItem, ShippingFee } from "@/prisma/models/cartItems";
import prisma from "@/prisma/prisma";
import { BadRequest, Success, Unauthorized } from "@/types/ApiResponseTypes";
import { DeliveryType, ImgType, OrderStatus } from "@/types/orderTypes";
import { getPricing, getPricingSingle } from "@/util/pricing";
import { Product, ProductType, Role, StockType, Term } from "@prisma/client";
import _ from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    const { prodId, SKU } = req.query;

    if (prodId && SKU) {
      let auction = await prisma.auctions.findFirst({
        where: {
          productId: prodId.toString(),
          SKU: SKU.toString(),
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      });
      let bidCount = await prisma.auctions.count({
        where: {
          productId: prodId.toString(),
          SKU: SKU.toString(),
        },
      });
      if (auction) {
        if (
          session &&
          (session.role === Role.Buyer || session.role === Role.Trader)
        ) {
          let myBid = await prisma.auctions.findFirst({
            where: {
              productId: prodId.toString(),
              SKU: SKU.toString(),
              createdByUserId: session.id,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          });
          if (myBid) {
            return res.status(200).json({
              currentBid: auction.amount,
              myBid: myBid.amount,
              totalBid: bidCount,
              id: myBid.id,
            });
          } else {
            return res.status(200).json({
              currentBid: auction.amount,
              myBid: 0,
              totalBid: bidCount,
            });
          }
        } else {
          return res.status(200).json({
            currentBid: auction.amount,
            totalBid: bidCount,
          });
        }
      } else {
        if (
          session &&
          (session.role === Role.Buyer || session.role === Role.Trader)
        ) {
          return res.status(200).json({
            currentBid: 0,
            myBid: 0,
            totalBid: bidCount,
          });
        } else {
          return res.status(200).json({
            currentBid: 0,
            totalBid: bidCount,
          });
        }
      }
    } else {
      return res.status(400).json(BadRequest);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
}
