// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import { getPricing } from "@/util/pricing";
import { Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    const products = await prisma.product.findMany({
      include: {
        Review: true,
        seller: true,
      },
      where: {
        isFeatured: true,
        seller: {
          isBlocked: false,
          isDeleted: false,
          sellAllow: true,
        },
      },
    });
    const featuredList: any = [];

    for (let i = 0; i < products.length; i++) {
      let productInfo: any = { ...products[i] };
      if (productInfo.createdAt) {
        delete productInfo.createdAt;
      }
      if (productInfo.updatedAt) {
        delete productInfo.updatedAt;
      }
      if (productInfo.brand) {
        if (productInfo.brand.createdAt) {
          delete productInfo.brand.createdAt;
        }
        if (productInfo.brand.updatedAt) {
          delete productInfo.brand.updatedAt;
        }
      }
      featuredList.push(products[i]);
    }
    res
      .status(200)
      .json(
        featuredList.filter((e: any) =>
          !session || session.role === Role.Buyer
            ? e.isPublished === true
            : true
        )
      );
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
}
