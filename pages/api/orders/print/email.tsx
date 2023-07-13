// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import { BadRequest } from "@/types/ApiResponseTypes";
import type { NextApiRequest, NextApiResponse } from "next";
import { render } from "@react-email/render";
import OrderEmail from "@/emails/order";
import { addCartItems } from "..";
import useAuth from "@/hooks/useAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const session = await useAuth(req);
    let { orderNo, isSeller } = req.query;
    if (orderNo) {
      let order: any = await prisma.order.findFirst({
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

      if (order.billingAddress) {
        let state = await prisma.state.findFirst({
          where: {
            id: order.billingAddress.stateId,
          },
        });
        order.billingAddress.stateStr = state.name;

        let district = await prisma.district.findFirst({
          where: {
            id: order.billingAddress.districtId,
          },
        });
        order.billingAddress.districtStr = district.name;

        let township = await prisma.township.findFirst({
          where: {
            id: order.billingAddress.townshipId,
          },
        });
        order.billingAddress.townshipStr = township.name;
      }
      if (order.shippingAddress) {
        let state = await prisma.state.findFirst({
          where: {
            id: order.shippingAddress.stateId,
          },
        });
        order.shippingAddress.stateStr = state.name;

        let district = await prisma.district.findFirst({
          where: {
            id: order.shippingAddress.districtId,
          },
        });
        order.shippingAddress.districtStr = district.name;

        let township = await prisma.township.findFirst({
          where: {
            id: order.shippingAddress.townshipId,
          },
        });
        order.shippingAddress.townshipStr = township.name;
      }

      order = await addCartItems(order);

      let emailHtml = render(
        <OrderEmail content={content!} order={order!} attributes={attributes} />
      );

      if (isSeller === "true") {
        emailHtml = render(
          <OrderEmail
            content={content!}
            order={order!}
            attributes={attributes}
            sellerId={session.id}
          />
        );
      }

      return res.send(emailHtml);
    } else {
      return res.status(400).json(BadRequest);
    }
  } catch (err) {
    console.log(err);
  }
}
