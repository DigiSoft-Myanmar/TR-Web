// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import { CartItem, ShippingFee } from "@/prisma/models/cartItems";
import prisma from "@/prisma/prisma";
import {
  BadRequest,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { DeliveryType, ImgType, OrderStatus } from "@/types/orderTypes";
import { isInternal } from "@/util/authHelper";
import { caesarEncrypt } from "@/util/encrypt";
import { getPricing, getPricingSingle } from "@/util/pricing";
import { Product, ProductType, Role, StockType, Term } from "@prisma/client";
import _, { sortBy } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    const { id } = req.query;

    if (id) {
      let product = await prisma.product.findFirst({
        where: {
          id: id.toString(),
        },
      });
      if (product) {
        let list = await prisma.auctions.findMany({
          where: {
            productId: id.toString(),
            SKU: product.SKU,
          },
        });
        return res.status(200).json(
          sortBy(list, (e) => e.amount)
            .reverse()
            .map((z) => {
              let userId = caesarEncrypt(z.createdByUserId, 5);
              return {
                ...z,
                createdByUserId: userId,
                isOwn: session?.id === z.createdByUserId ? true : false,
              };
            })
        );
      } else {
        return res.status(404).json(NotAvailable);
      }
    } else if (session) {
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
        distinct: "productId",
      });

      return res.status(200).json(auctionsList);
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
}
