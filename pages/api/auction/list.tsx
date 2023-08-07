// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import { CartItem, ShippingFee } from "@/prisma/models/cartItems";
import prisma from "@/prisma/prisma";
import { BadRequest, Success, Unauthorized } from "@/types/ApiResponseTypes";
import { DeliveryType, ImgType, OrderStatus } from "@/types/orderTypes";
import { isInternal, isSeller } from "@/util/authHelper";
import { getPricing, getPricingSingle } from "@/util/pricing";
import { Product, ProductType, Role, StockType, Term } from "@prisma/client";
import _, { includes, sortBy } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);

    if (isInternal(session) || isSeller(session)) {
      let filter: any = {};
      if (isInternal(session)) {
        filter = {};
      } else if (session.role === Role.Buyer) {
        filter = {
          auction: {
            createdByUserId: session.id,
          },
        };
      } else if (session.role === Role.Seller) {
        filter = {
          product: {
            sellerId: session.id,
          },
        };
      } else if (session.role === Role.Trader) {
        filter = {
          product: {
            sellerId: session.id,
          },
        };
      }

      let wonList = await prisma.wonList.findMany({
        where: filter,
        include: {
          product: {
            include: {
              seller: true,
            },
          },
          auction: {
            include: {
              createdBy: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
      let prodFilter: any = {
        type: ProductType.Auction,
        endTime: {
          lte: new Date(),
        },
      };
      if (isInternal(session)) {
      } else {
        prodFilter = {
          ...prodFilter,
          sellerId: session.id,
        };
      }

      const prodList = await prisma.product.findMany({
        where: prodFilter,
        include: {
          WonList: true,
          Auctions: {
            include: {
              createdBy: true,
            },
          },
          seller: true,
        },
      });
      let list = prodList.filter(
        (a) =>
          wonList.find((z) => z.product.SKU === a.SKU) === undefined &&
          a.Auctions.length > 0
      );

      return res.status(200).json({
        newList: list.map((z) => {
          let auction = sortBy(z.Auctions, (b) => b.amount).reverse()[0];
          return { ...z, isProduct: true, auction: auction };
        }),
        wonList: wonList,
      });
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
}
