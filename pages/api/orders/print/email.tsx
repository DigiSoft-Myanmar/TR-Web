// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import { BadRequest } from "@/types/ApiResponseTypes";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let { orderNo } = req.query;
    if (orderNo) {
      const order = await prisma.order.findFirst({
        include: {
          orderBy: true,
          promoCode: true,
        },
        where: {
          orderNo: parseInt(orderNo.toString()),
        },
      });
      return res.send(await generateHTML(order));
    } else {
      return res.status(400).json(BadRequest);
    }
  } catch (err) {
    console.log(err);
  }
}

export async function generateHTML(order: any) {
  return "";
}
