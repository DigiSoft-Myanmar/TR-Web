import prisma from "@/prisma/prisma";
import { NotAvailable } from "@/types/ApiResponseTypes";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { slug } = req.query;
    const product = await prisma.product.findFirst({
      where: { slug: slug.toString() },
      include: {
        Condition: true,
        Brand: true,
        categories: true,
        seller: true,
        UnitSold: true,
        Review: true,
        WonList: true,
      },
    });
    if (product) {
      return res.status(200).json(product);
    } else {
      return res.status(404).json(NotAvailable);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
}
