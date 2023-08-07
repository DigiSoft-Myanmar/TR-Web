// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import {
  BadRequest,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import { Message } from "@/lib/firebaseAdmin";
import {
  addNotification,
  getAdminIdList,
  getStaffIdList,
} from "@/util/notiHelper";
import {
  OrderPermission,
  otherPermission,
  SellerPermission,
  TraderPermission,
} from "@/types/permissionTypes";
import prisma from "@/prisma/prisma";
import { NotiType, Role } from "@prisma/client";
import { encryptPhone } from "@/util/encrypt";
import { OrderStatus } from "@/types/orderTypes";
import { sendOrderEmail } from "@/util/emailNodeHelper";

async function test(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let { key } = req.query;
    if (key && key.toString() === "rmRNMOIQ9P") {
      //check membership
      let date = new Date();
      date.setDate(date.getDate() - 2);

      let seller = await prisma.user.findMany({
        where: {
          lastLogin: {
            lte: date,
          },
          role: {
            in: [Role.Seller, Role.Trader],
          },
        },
      });
      let orders = await prisma.order.findMany({
        where: {
          sellerIds: {
            hasSome: seller.map((z) => z.id),
          },
        },
      });
      for (let i = 0; i < orders.length; i++) {
        let sellerResponse: any = [...orders[i].sellerResponse];
        for (let j = 0; j < seller.length; j++) {
          let status = sellerResponse.find((z) => z.sellerId === seller[j].id);
          if (status) {
            if (
              sellerResponse.find((z) => z.sellerId === seller[j].id)
                .statusHistory.length === 1
            ) {
              let adminList = await getAdminIdList();
              let staffList = await getStaffIdList(
                OrderPermission.orderNotiAllow
              );

              let msg: any = {
                body:
                  orders[i].orderNo +
                  " was auto cancelled since no action taken by seller: " +
                  seller[j].username,
                createdAt: new Date().toISOString(),
                title: "Auto cancelled for Order #" + orders[i].orderNo,
                type: NotiType.AutoCancelledOrder,
                requireInteraction: false,
                sendList: [
                  ...adminList,
                  ...staffList,
                  orders[i].orderByUserId,
                  seller[j].id,
                ],
                details: {
                  web: "/orders/" + encodeURIComponent(orders[j].orderNo),
                  mobile: {
                    screen: "Orders",
                    slug: orders[j].orderNo,
                  },
                },
              };
              await addNotification(msg, "");

              sellerResponse
                .find((z) => z.sellerId === seller[j].id)
                .statusHistory.push({
                  status: OrderStatus.AutoCancelled,
                  updatedDate: new Date().toISOString(),
                });
            }
          }
        }
        let order = await prisma.order.update({
          where: {
            id: orders[i].id,
          },
          data: {
            sellerResponse: sellerResponse,
          },
        });
        for (let k = 0; k < seller.length; k++) {
          if (order.sellerIds.includes(seller[k].id)) {
            await sendOrderEmail(
              order,
              seller[k].username +
                " " +
                OrderStatus.AutoCancelled +
                " for #" +
                order.orderNo
            );
          }
        }
      }

      return res.status(200).json(Success);
    } else {
      return res.status(400).json(BadRequest);
    }
  } catch (err) {
    res.status(400).json(err);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  switch (req.method) {
    case "GET":
      return test(req, res);
    default:
      return res.status(405).json(NotAvailable);
  }
}
