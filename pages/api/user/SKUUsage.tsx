// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import { ProductType } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const { brandId } = req.query;
    let prodCount = 0;

    let fixedCount = await prisma.product.count({
      where: {
        sellerId: brandId?.toString(),
        isPublished: true,
        type: ProductType.Fixed,
      },
    });

    let auctionProds = await prisma.product.findMany({
      where: {
        sellerId: brandId?.toString(),
        isPublished: true,
        type: ProductType.Auction,
      },
      include: {
        Auctions: true,
      },
    });

    let auctionCount = 0;
    for (let i = 0; i < auctionProds.length; i++) {
      if (auctionProds[i].Auctions.length > 0) {
        let uniqueSKU = Array.from(
          new Set(auctionProds[i].Auctions.map((item) => item.SKU))
        ).map((sku) => ({ SKU: sku }));

        auctionCount += uniqueSKU.length;
      } else {
        auctionCount += 1;
      }
    }

    let variableProds = await prisma.product.findMany({
      where: {
        sellerId: brandId?.toString(),
        isPublished: true,
        type: ProductType.Variable,
      },
    });

    let variableCount = 0;
    for (let i = 0; i < variableProds.length; i++) {
      variableCount += variableProds[i].variations.length;
    }

    //console.log(fixedCount, auctionCount, variableCount);

    return res
      .status(200)
      .json({ Usage: fixedCount + auctionCount + variableCount });
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
