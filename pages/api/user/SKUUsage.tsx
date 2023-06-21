// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const { brandId } = req.query;
    let prodCount = await prisma.product.count({
      where: {
        sellerId: brandId?.toString(),
        isPublished: true,
      },
    });
    return res.status(200).json({ Usage: prodCount });
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
