import prisma from "@/prisma/prisma";
import { ProductType, Role } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let data = require("./brands.json");

    await prisma.product.deleteMany({
      where: {
        type: ProductType.Variable,
      },
    });
    return res.status(200).json({ prodCount: data.length });
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
