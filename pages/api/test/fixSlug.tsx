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
    let products = await prisma.product.findMany({
      where: {
        type: ProductType.Variable,
      },
      include: {
        seller: true,
      },
    });
    for (let i = 0; i < products.length; i++) {
      console.log(products[i].slug);
      if (products[i].slug.includes("undefined")) {
        let slug = products[i].seller.username;
        let count = await prisma.product.count({
          where: {
            slug: slug,
          },
        });
        if (count > 0) {
          slug = slug + "_" + (count + 1);
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
    }

    return res.status(200).json({ prodCount: prodCount });
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
