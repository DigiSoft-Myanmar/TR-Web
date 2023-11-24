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
      let today = new Date();

      let date = new Date(today.toISOString().split("T")[0]);
      date.setDate(date.getDate() - 3);

      let oneMonth = new Date(today.toISOString().split("T")[0]);
      oneMonth.setMonth(oneMonth.getMonth() - 1);

      let seller = await prisma.user.findMany({
        where: {
          lastLogin: {
            lte: oneMonth,
          },
          role: {
            in: [Role.Seller, Role.Trader],
          },
        },
      });
      let orders = await prisma.order.findMany({
        where: {
          OR: [
            {
              sellerIds: {
                hasSome: seller.map((z) => z.id),
              },
            },
            {
              createdAt: {
                lte: date,
              },
            },
          ],
        },
      });
      for (let i = 0; i < orders.length; i++) {
        let sellerResponse: any = [...orders[i].sellerResponse];
        let changedSeller = [];
        let update = false;
        for (let j = 0; j < orders[i].sellerIds.length; j++) {
          let status = sellerResponse.find(
            (z) => z.sellerId === orders[i].sellerIds[j]
          );
          if (status) {
            if (
              sellerResponse.find((z) => z.sellerId === orders[i].sellerIds[j])
                .statusHistory.length === 1
            ) {
              let adminList = await getAdminIdList();
              let staffList = await getStaffIdList(
                OrderPermission.orderNotiAllow
              );
              changedSeller.push(orders[i].sellerIds[j]);

              let cancelledSeller = await prisma.user.findFirst({
                where: {
                  id: orders[i].sellerIds[j],
                },
              });

              let msg: any = {
                body:
                  orders[i].orderNo +
                  " was auto cancelled since no action taken by seller: " +
                  cancelledSeller?.username,
                createdAt: new Date().toISOString(),
                title: "Auto cancelled for Order #" + orders[i].orderNo,
                type: NotiType.AutoCancelledOrder,
                requireInteraction: false,
                sendList: [
                  ...adminList,
                  ...staffList,
                  orders[i].orderByUserId,
                  orders[i].sellerIds[j],
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
                .find((z) => z.sellerId === orders[i].sellerIds[j])
                .statusHistory.push({
                  status: OrderStatus.AutoCancelled,
                  updatedDate: new Date().toISOString(),
                });
              update = true;
            }
          }
        }
        if (update === true) {
          let order = await prisma.order.update({
            where: {
              id: orders[i].id,
            },
            data: {
              sellerResponse: sellerResponse,
            },
          });
          for (let k = 0; k < changedSeller.length; k++) {
            let cancelledSeller = await prisma.user.findFirst({
              where: {
                id: changedSeller[k],
              },
            });
            await sendOrderEmail(
              order,
              cancelledSeller?.username +
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
