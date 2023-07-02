// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import { CartItem, ShippingFee } from "@/prisma/models/cartItems";
import prisma from "@/prisma/prisma";
import { BadRequest, Success, Unauthorized } from "@/types/ApiResponseTypes";
import { DeliveryType, ImgType, OrderStatus } from "@/types/orderTypes";
import { isInternal } from "@/util/authHelper";
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

    if (session) {
      let filter: any = {};
      if (isInternal(session)) {
        filter = {};
      } else if (session.role === Role.Buyer) {
        filter = {
          createdByUserId: session.id,
        };
      } else if (session.role === Role.Seller) {
        filter = {
          product: {
            sellerId: session.id,
          },
        };
      } else if (session.role === Role.Trader) {
        filter = {
          OR: [
            {
              createdByUserId: session.id,
            },
            {
              product: {
                sellerId: session.id,
              },
            },
          ],
        };
      }

      let auctionsList = await prisma.auctions.findMany({
        where: filter,
        include: {
          createdBy: true,
          product: true,
          WonList: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json(auctionsList);
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
}
