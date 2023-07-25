import { SortByType } from "@/components/presentational/SortSelectBox";
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import {
  BadRequest,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { otherPermission } from "@/types/permissionTypes";
import { ProductNavType } from "@/types/productTypes";
import { canAccess } from "@/util/roleHelper";
import { ProductType, Role } from "@prisma/client";
import { cond } from "lodash";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useAuth(req);
  switch (req.method) {
    case "GET": {
      let { productId, sellerId, categories } = req.query;

      let filter: any = {
        isPublished: true,
        OR: [
          { type: ProductType.Fixed },
          { type: ProductType.Variable },
          {
            type: ProductType.Auction,
            endTime: {
              gte: new Date(),
            },
          },
        ],
        seller: {
          isBlocked: false,
          isDeleted: false,
          sellAllow: true,
        },
        id: {
          not: productId.toString(),
        },
      };
      let c: any = [];
      if (categories) {
        if (typeof categories === "string") {
          if (categories.split(",").length > 0) {
            c = categories.split(",");
          } else {
            c = [categories];
          }
        } else {
          c = categories;
        }
      }
      if (c.length > 0) {
        filter = {
          ...filter,
          categoryIds: {
            hasSome: c,
          },
        };
      }

      let sortQry: any = {
        seller: {
          currentMembership: {
            topSearchStart: "asc",
          },
        },
      };

      const products: any = await prisma.product.findMany({
        include: {
          categories: {
            include: {
              subCategory: true,
            },
          },
          Condition: true,
          Brand: true,
          seller: true,
          UnitSold: true,
          Review: true,
          WonList: true,
        },
        orderBy: sortQry,
        take: 5,
        where: filter,
      });

      const relatedProducts: any = await prisma.product.findMany({
        include: {
          categories: {
            include: {
              subCategory: true,
            },
          },
          Condition: true,
          Brand: true,
          seller: true,
          UnitSold: true,
          Review: true,
          WonList: true,
        },
        orderBy: sortQry,
        take: 5,
        where: {
          sellerId: sellerId.toString(),
          id: {
            not: productId.toString(),
          },
          seller: {
            isBlocked: false,
            isDeleted: false,
            sellAllow: true,
          },
        },
      });

      return res.status(200).json({
        sellerProducts: relatedProducts,
        relatedProducts: products,
      });
    }
    default:
      return res.status(405).json(NotAvailable);
  }
}
