import { firebaseAdmin } from "@/lib/firebaseAdmin";
import prisma from "@/prisma/prisma";
import { getPricing } from "@/util/pricing";
import { ProductType, Role } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let prodCount = 0;
    let products: any = await prisma.product.findMany({
      where: {
        type: ProductType.Variable,
      },
      include: {
        seller: true,
      },
    });
    for (let i = 0; i < products.length; i++) {
      let slug = products[i].seller.username;
      if (slug && products[i].variations && products[i].variations.length > 0) {
        slug = slug + "#" + products[i].variations[0].SKU;
      }
      let count = await prisma.product.count({
        where: {
          slug: slug,
        },
      });
      if (count > 0) {
        slug = slug + "_" + Date.now();
      }
      await prisma.product.update({
        where: {
          id: products[i].id,
        },
        data: {
          slug: slug,
        },
      });
      prodCount++;
    }

    return res.status(200).json({ prodCount: prodCount });
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
