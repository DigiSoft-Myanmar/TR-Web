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

async function test(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let { key } = req.query;
    if (key && key.toString() === "rmRNMOIQ9P") {
      //check membership
      let user = await prisma.user.findMany({
        where: {
          role: {
            in: [Role.Trader, Role.Seller],
          },
        },
        include: {
          currentMembership: true,
        },
      });

      let sellerNotiIdList = await getStaffIdList(
        SellerPermission.sellerNotiAllow
      );
      let traderNotiIdList = await getStaffIdList(
        TraderPermission.traderNotiAllow
      );
      let staffList = [...sellerNotiIdList, ...traderNotiIdList];
      staffList = Array.from(new Set(staffList));

      let adminList = await getAdminIdList();

      for (let i = 0; i < user.length; i++) {
        let startDate = new Date(user[i].memberStartDate);
        let duration = user[i].currentMembership!.validity;
        startDate.setDate(startDate.getDate() + duration);

        let beforeOneWeek = new Date();
        beforeOneWeek.setDate(beforeOneWeek.getDate() - 7);

        if (startDate < new Date()) {
          let sellerNoti: any = {
            body: "Since membership expired date reached, You cannot performed sell products and all your products are unpublished.",
            title: "Membership expired",
            createdTime: new Date().toISOString(),
            type: NotiType.MembershipExpired,
            requireInteraction: false,
            sendList: [user[i].id.toString()],
          };

          await addNotification(sellerNoti);

          let otherNoti: any = {
            body: "Since membership expired date reached, Sell products and all related products are unpublished.",
            createdAt: new Date().toISOString(),
            title: "Membership expired by " + user[i].username,
            type: NotiType.MembershipExpired,
            requireInteraction: false,
            sendList: [...adminList, ...staffList],
            details: {
              web:
                "/account/" +
                encodeURIComponent(encryptPhone(user[i].phoneNum)),
            },
          };

          await addNotification(otherNoti);

          await prisma.user.update({
            where: {
              id: user[i].id,
            },
            data: {
              sellAllow: false,
            },
          });

          /* await prisma.product.updateMany({
            where: {
              sellerId: user[i].id,
            },
            data: {
              isPublished: false,
              isFeatured: false,
            },
          }); */
        } else if (startDate < beforeOneWeek) {
          let sellerNoti: any = {
            body:
              "Membershi will expired on " +
              startDate.toLocaleDateString("en-ca", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              }),
            title: "Membership near expired",
            createdTime: new Date().toISOString(),
            type: NotiType.MembershipNearExpired,
            requireInteraction: false,

            sendList: [user[i].id.toString()],
          };
          await addNotification(sellerNoti);

          let otherNoti: any = {
            body:
              "Membershi will expired on " +
              startDate.toLocaleDateString("en-ca", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              }),
            title: "Membership near expired by " + user[i].username,
            createdTime: new Date().toISOString(),
            type: NotiType.MembershipExpired,
            requireInteraction: true,
            sendList: [...adminList, ...staffList],
            details: {
              web:
                "/account/" +
                encodeURIComponent(encryptPhone(user[i].phoneNum)),
            },
          };

          await addNotification(otherNoti);
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
