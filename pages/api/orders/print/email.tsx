// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import { BadRequest } from "@/types/ApiResponseTypes";
import type { NextApiRequest, NextApiResponse } from "next";
import { render } from "@react-email/render";
import OrderEmail from "@/emails/order";
import { addCartItems } from "..";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let { orderNo } = req.query;
    if (orderNo) {
      let order = await prisma.order.findFirst({
        include: {
          orderBy: true,
          promoCodes: true,
        },
        where: {
          orderNo: parseInt(orderNo.toString()),
        },
      });

      for (let i = 0; i < order.sellerResponse.length; i++) {
        let orderResponse: any = order.sellerResponse[i];
        let seller = await prisma.user.findFirst({
          where: {
            id: orderResponse.sellerId,
          },
        });
        if (seller) {
          orderResponse.seller = seller;
        }
      }

      const attributes = await prisma.attribute.findMany({
        include: {
          Term: true,
        },
      });

      const content = await prisma.content.findFirst({});

      order = await addCartItems(order);

      const emailHtml = render(
        <OrderEmail content={content!} order={order!} attributes={attributes} />
      );

      return res.send(emailHtml);
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
