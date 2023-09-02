// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import { createTerm, deleteTerm, updateTerm } from "@/prisma/models/product";
import { getUserByPhone, updateUser } from "@/prisma/models/user";
import prisma from "@/prisma/prisma";
import {
  AlreadyExists,
  BadRequest,
  Exists,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import {
  BuyerPermission,
  SellerPermission,
  TraderPermission,
} from "@/types/permissionTypes";
import {
  hasPermission,
  isBuyer,
  isInternal,
  isSeller,
} from "@/util/authHelper";
import { encryptPhone } from "@/util/encrypt";
import {
  addNotification,
  getAdminIdList,
  getStaffIdList,
} from "@/util/notiHelper";
import { NotiType, ProductType, Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let { phoneNum } = req.query;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (phoneNum) {
      switch (req.method) {
        case "POST":
          let reqData: any = {};
          if (typeof req.body === "object") {
            reqData = req.body;
          } else {
            reqData = JSON.parse(req.body);
          }
          console.log(reqData);
          const session = await useAuth(req);
          if (
            (session && session.phoneNum === phoneNum) ||
            (session &&
              (session.role === Role.Admin ||
                session.role === Role.Staff ||
                session.role === Role.SuperAdmin))
          ) {
            if (
              session.role === Role.Staff &&
              reqData &&
              reqData.user.role === Role.Buyer &&
              !hasPermission(session, BuyerPermission.buyerUpdateAllow)
            ) {
              return res.status(401).json(Unauthorized);
            }
            if (
              session.role === Role.Staff &&
              reqData &&
              reqData.user.role === Role.Seller &&
              !hasPermission(session, SellerPermission.sellerUpdateAllow)
            ) {
              return res.status(401).json(Unauthorized);
            }
            if (
              session.role === Role.Staff &&
              reqData &&
              reqData.user.role === Role.Trader &&
              !hasPermission(session, TraderPermission.traderUpdateAllow)
            ) {
              return res.status(401).json(Unauthorized);
            }

            if (phoneNum && reqData) {
              try {
                let user = await getUserByPhone(phoneNum.toString());
                if (user) {
                  let profile: any = reqData.user;

                  if (profile.id) {
                    delete profile.id;
                  }
                  if (profile.createdAt) {
                    delete profile.createdAt;
                  }
                  if (profile.updatedAt) {
                    delete profile.updatedAt;
                  }
                  if (profile.state) {
                    delete profile.state;
                  }
                  if (profile.district) {
                    delete profile.district;
                  }
                  if (profile.township) {
                    delete profile.township;
                  }
                  if (profile.Membership) {
                    delete profile.Membership;
                  }

                  if (
                    isSeller(user) &&
                    user.membershipId !== profile.membershipId
                  ) {
                    let adminList = await getAdminIdList();
                    let staffList = await getStaffIdList(
                      user.role === Role.Seller
                        ? SellerPermission.sellerNotiAllow
                        : user.role === Role.Trader
                        ? TraderPermission.traderNotiAllow
                        : ""
                    );

                    let msg: any = {
                      body: "Membership for " + user.username + " was updated",
                      createdAt: new Date().toISOString(),
                      title: "Membership Updated",
                      type: NotiType.UpdateMembership,
                      requireInteraction: false,
                      sendList: [...adminList, ...staffList],
                      details: {
                        web:
                          "/account/" +
                          encodeURIComponent(encryptPhone(user.phoneNum)),
                      },
                    };
                    await addNotification(msg, "");
                  }

                  if (
                    isInternal(session) &&
                    profile.sellAllow === true &&
                    user.sellAllow === false
                  ) {
                    let adminList = await getAdminIdList();
                    let staffList = await getStaffIdList(
                      user.role === Role.Seller
                        ? SellerPermission.sellerNotiAllow
                        : user.role === Role.Trader
                        ? TraderPermission.traderNotiAllow
                        : ""
                    );

                    let msg: any = {
                      body:
                        user.username +
                        ", you can now list your products to sell on Marketplace.",
                      createdAt: new Date().toISOString(),
                      title: "Approved Membership",
                      type: NotiType.UpdateMembership,
                      requireInteraction: false,
                      sendList: [...adminList, ...staffList, user.id],
                      details: {
                        web:
                          "/account/" +
                          encodeURIComponent(encryptPhone(user.phoneNum)),
                        mobile: {
                          screen: "Account",
                          slug: user.phoneNum,
                        },
                      },
                    };
                    console.log("Fire");
                    await addNotification(msg, "");
                  }

                  if (profile.email) {
                    profile.email = profile.email.toLowerCase();
                  }

                  let updateUserRes = await updateUser(user.id, profile);
                  if (updateUserRes.isSuccess === true) {
                    res.status(200).json(Success);
                  } else {
                    res.status(400).json({ error: updateUserRes.error });
                  }
                }
              } catch (err: any) {
                console.log(err);
                res.status(400).json(err);
              }
            } else {
              res.status(400).json(BadRequest);
            }
          } else {
            res.status(401).json(Unauthorized);
          }
          break;
        default:
          return res.status(501).json(NotAvailable);
      }
    } else {
      return res.status(400).json(BadRequest);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
