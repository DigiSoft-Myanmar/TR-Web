import { render } from "@react-email/render";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/prisma/prisma";
import { BadRequest, Success, Unauthorized } from "@/types/ApiResponseTypes";
import useAuth from "@/hooks/useAuth";
import OrderEmail from "@/emails/order";
import { addCartItems } from ".";
import { sendEmailNodeFn } from "@/util/emailNodeHelper";
import { Role } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks

    const { orderNo, isMailer, sendTo } = req.query;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    if (!session) {
      return res.status(401).json(Unauthorized);
    }
    if (sendTo) {
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

        const emailHtml = render(
          <OrderEmail
            content={content!}
            order={order!}
            attributes={attributes}
          />
        );

        const sellerList = await prisma.user.findMany({
          where: {
            role: {
              in: [Role.Seller, Role.Trader],
            },
            email: {
              isSet: true,
            },
            id: {
              in: order.sellerIds,
            },
          },
        });
        let sellerEmail = sellerList.map((z) => z.email);

        //return res.send(emailHtml);
        let sendList = [];

        if (typeof sendTo === "string") {
          sendList = sendTo.split(",");
        } else {
          sendList = sendTo;
        }

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        for (let i = 0; i < sendList.length; i++) {
          res.write(`data: Sending email to ${sendList[i]}...\n\n`);
          if (sellerEmail.find((z) => z === sendList[i])) {
            let sellerHtml = render(
              <OrderEmail
                content={content!}
                order={order!}
                attributes={attributes}
                sellerId={sellerList.find((z) => z.email === sendList[i]).id}
              />
            );
            await sendEmailNodeFn("Order #" + order.orderNo, sellerHtml, [
              sendList[i],
            ]);
          } else {
            await sendEmailNodeFn("Order #" + order.orderNo, emailHtml, [
              sendList[i],
            ]);
          }
          res.write(`data: Email sent to ${sendList[i]}.\n\n`);
        }

        req.on("close", () => {
          res.end();
        });
      } else {
        return res.status(400).json(BadRequest);
      }
      return res.status(200).json(Success);
    } else {
      return res.status(400).json(BadRequest);
    }
  } catch (err) {
    console.log(err);
    res.status(200).json(err);
  }
}
