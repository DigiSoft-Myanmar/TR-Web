// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";
import {
  createBuyer,
  createSeller,
  createUser,
  deleteUser,
  getAllUser,
  getUserByEmail,
  getUserByPhone,
} from "@/prisma/models/user";
import prisma from "@/prisma/prisma";
import {
  BadRequest,
  NotAvailable,
  Success,
  Unauthorized,
  UsersExists,
} from "@/types/ApiResponseTypes";
import {
  BuyerPermission,
  SellerPermission,
  StaffPermission,
  SubscribePermission,
  TraderPermission,
} from "@/types/permissionTypes";
import { RoleNav } from "@/types/role";
import { hasPermission, isInternal, isSeller } from "@/util/authHelper";
import { encryptPhone } from "@/util/encrypt";
import {
  addNotification,
  getAdminIdList,
  getStaffIdList,
} from "@/util/notiHelper";
import { Gender, NotiType, Role, User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

async function addShippingInfo(user: any) {
  if (user.role === Role.Seller || user.role === Role.Trader) {
    const shippingFees = await prisma.shippingCost.findMany({
      where: {
        sellerId: user.id,
        shippingCost: {
          not: user.defaultShippingCost ? user.defaultShippingCost : 0,
        },
      },
    });
    user.shippingInfo = {
      shippingIncluded: user.shippingIncluded,
      defaultShippingCost: user.defaultShippingCost,
      isDiff: shippingFees.length > 0 ? true : false,
    };
    const freeShippingFees = await prisma.shippingCost.findMany({
      where: {
        sellerId: user.id,
        freeShippingCost: {
          not: user.freeShippingCost ? user.freeShippingCost : 0,
        },
      },
    });
    user.freeShippingInfo = {
      shippingIncluded: user.shippingIncluded,
      isOfferFreeShipping: user.isOfferFreeShipping,
      freeShippingCost: user.freeShippingCost,
      isDiff: freeShippingFees.length > 0 ? true : false,
    };
  }
  return user;
}

async function getUser(req: NextApiRequest, res: NextApiResponse<any>) {
  const {
    isLogin,
    phone,
    uid,
    type,
    email,
    isSeller,
    id,
    nrcState,
    nrcTownship,
    nrcType,
    nrcNumber,
  } = req.query;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useAuth(req);
  if (nrcState && nrcTownship && nrcType && nrcNumber && id) {
    let user = await prisma.user.findFirst({
      where: {
        id: {
          not: id.toString(),
        },
        nrcState: nrcState.toString(),
        nrcTownship: nrcTownship.toString(),
        nrcNumber: nrcNumber.toString(),
        nrcType: nrcType.toString(),
      },
    });
    if (user) {
      return res.status(200).json(UsersExists);
    } else {
      return res.status(404).json(NotAvailable);
    }
  } else if (isLogin === "true" && phone && uid) {
    let user = await getUserByPhone(phone.toString());
    if (user && user.isBlocked === false && user.isDeleted === false) {
      return res.status(200).json(user);
    } else if (user.isBlocked === true || user.isDeleted === true) {
      return res.status(405).json({
        isBlocked: user.isBlocked,
        isDeleted: user.isDeleted,
      });
    } else {
      return res.status(404).json(NotAvailable);
    }
  } else if (isLogin && phone) {
    let user = await getUserByPhone(phone.toString());
    if (user && user.isBlocked === false && user.isDeleted === false) {
      return res.status(200).json(user);
    } else if (user.isBlocked === true || user.isDeleted === true) {
      return res.status(405).json({
        isBlocked: user.isBlocked,
        isDeleted: user.isDeleted,
      });
    } else {
      return res.status(404).json(NotAvailable);
    }
  } else if (isLogin && email) {
    let user = await getUserByEmail(email.toString());
    if (user && user.isBlocked === false && user.isDeleted === false) {
      return res.status(200).json(user);
    } else if (user.isBlocked === true || user.isDeleted === true) {
      return res.status(405).json({
        isBlocked: user.isBlocked,
        isDeleted: user.isDeleted,
      });
    } else {
      return res.status(404).json(NotAvailable);
    }
  } else if (
    session &&
    (session.role === Role.Admin ||
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin)
  ) {
    if (isSeller?.toString() === "true") {
      let user = await prisma.user.findMany({
        where: {
          role: {
            in: [Role.Seller, Role.Trader],
          },
        },
        include: {
          currentMembership: true,
        },
      });
      for (let i = 0; i < user.length; i++) {
        let shippingInfo = await addShippingInfo(user[i]);
        user[i] = { ...user[i], ...shippingInfo };
      }
      return res.status(200).json(user);
    } else {
      if (session.role === Role.Staff) {
        if (
          type?.toString() === RoleNav.Buyers ||
          type?.toString() === Role.Buyer
        ) {
          if (!hasPermission(session, BuyerPermission.buyerViewAllow)) {
            return res.status(401).json(Unauthorized);
          }
        }
        if (
          type?.toString() === RoleNav.Sellers ||
          type?.toString() === Role.Seller
        ) {
          if (!hasPermission(session, SellerPermission.sellerViewAllow)) {
            return res.status(401).json(Unauthorized);
          }
        }

        if (
          type?.toString() === RoleNav.Traders ||
          type?.toString() === Role.Trader
        ) {
          if (!hasPermission(session, TraderPermission.traderViewAllow)) {
            return res.status(401).json(Unauthorized);
          }
        }

        if (
          type?.toString() === RoleNav.Staff ||
          type?.toString() === Role.Staff
        ) {
          if (!hasPermission(session, StaffPermission.staffViewAllow)) {
            return res.status(401).json(Unauthorized);
          }
        }
      }
      let user: any = await getAllUser(type?.toString());

      return res.status(200).json(user);
    }
  } else {
    return res.status(400).json(BadRequest);
  }
}

async function addUser(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let session = await useAuth(req);
    let data = JSON.parse(req.body);
    if (data.email) {
      data.email = data.email.toLowerCase();
    }
    if (data.role) {
      if (isInternal(session)) {
        if (
          session.role === Role.Staff &&
          data.role === Role.Buyer &&
          !hasPermission(session, BuyerPermission.buyerCreateAllow)
        ) {
          return res.status(401).json(Unauthorized);
        }

        if (
          session.role === Role.Staff &&
          data.role === Role.Seller &&
          !hasPermission(session, SellerPermission.sellerCreateAllow)
        ) {
          return res.status(401).json(Unauthorized);
        }

        if (
          session.role === Role.Staff &&
          data.role === Role.Trader &&
          !hasPermission(session, TraderPermission.traderCreateAllow)
        ) {
          return res.status(401).json(Unauthorized);
        }

        if (
          session.role === Role.Staff &&
          data.role === Role.Staff &&
          !hasPermission(session, StaffPermission.staffUpdateAllow)
        ) {
          return res.status(401).json(Unauthorized);
        }

        let body = {
          email: data.email?.toLowerCase(),
          emailVerified: false,
          phoneNumber: data.phoneNum,
          password: data.password,
          disabled: false,
        };
        try {
          if (data.email) {
            let sameEmail = await firebaseAdmin
              .auth()
              .getUserByEmail(data.email.toLowerCase());
            if (sameEmail) {
              return { isSuccess: false, error: "Email already exists." };
            }
          }
        } catch (err) {}
        console.log(body);
        let result = await firebaseAdmin
          .auth()
          .createUser(body)
          .then(async (a) => {
            let user = undefined;
            let b = { ...data };
            if (b.password) {
              delete b.password;
            }
            if (b.confirmPassword) {
              delete b.confirmPassword;
            }
            if (!b.gender) {
              b.gender = Gender.Male;
            }
            user = await prisma.user.create({
              data: b,
            });
            return { isError: false, data: user };
          })
          .catch((err) => {
            console.log(err);
            return { isError: true, data: err };
          });
        if (result.isError === true) {
          return res.status(400).json(result.data);
        } else {
          return res.status(200).json(Success);
        }
      } else {
        let b: any = { ...data };
        if (b.otp) {
          delete b.otp;
        }
        if (isInternal(b)) {
          return res.status(400).json(BadRequest);
        } else {
          if (b.role === Role.Seller || b.role === Role.Trader) {
            let adminList = await getAdminIdList();
            let staffList = await getStaffIdList(
              b.role === Role.Seller
                ? SellerPermission.sellerNotiAllow
                : b.role === Role.Trader
                ? TraderPermission.traderNotiAllow
                : ""
            );

            let msg: any = {
              body:
                b.username +
                ", " +
                b.phoneNum +
                " was registered at " +
                new Date().toLocaleDateString("en-ca", {
                  timeZone: "Asia/Yangon",
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }) +
                ".",
              createdAt: new Date().toISOString(),
              title: "New " + b.role + " Registration",
              type: NotiType.NewUser,
              requireInteraction: false,
              sendList: [...adminList, ...staffList],
              details: {
                web:
                  b.role === Role.Seller
                    ? "/users/" + RoleNav.Sellers
                    : "/users/" + RoleNav.Traders,
              },
            };
            await addNotification(msg, "");
          }
          if (b.email) {
            b.email = b.email.toLowerCase();
            try {
              let sameEmail = await firebaseAdmin
                .auth()
                .getUserByEmail(b.email);
              if (sameEmail) {
                return { isSuccess: false, error: "Email already exists." };
              }
            } catch (err) {}
          }
          let user = await prisma.user.create({
            data: b,
          });
          return res.status(200).json(Success);
        }
      }
    }
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const session = await useAuth(req);
  let { id, type } = req.query;

  switch (req.method) {
    case "GET":
      return getUser(req, res);
    case "POST":
      let response = await addUser(req, res);
      console.log(response);
      return response;
    case "PUT":
      let data = JSON.parse(req.body);
      if (id) {
        let user = await prisma.user.findFirst({
          where: {
            id: id.toString(),
          },
        });
        if (user) {
          if (
            session.role === Role.Staff &&
            user.role === Role.Buyer &&
            !hasPermission(session, BuyerPermission.buyerUpdateAllow)
          ) {
            return res.status(401).json(Unauthorized);
          }
          if (
            session.role === Role.Staff &&
            user.role === Role.Seller &&
            !hasPermission(session, SellerPermission.sellerUpdateAllow)
          ) {
            return res.status(401).json(Unauthorized);
          }
          if (
            session.role === Role.Staff &&
            user.role === Role.Trader &&
            !hasPermission(session, TraderPermission.traderUpdateAllow)
          ) {
            return res.status(401).json(Unauthorized);
          }
          if (
            session.role === Role.Staff &&
            user.role === Role.Staff &&
            !hasPermission(session, StaffPermission.staffUpdateAllow)
          ) {
            return res.status(401).json(Unauthorized);
          }

          if (isSeller(user) && user.membershipId !== data.membershipId) {
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
                  "/account/" + encodeURIComponent(encryptPhone(user.phoneNum)),
              },
            };
            await addNotification(msg, "");
          }
          if (
            isInternal(session) &&
            data.sellAllow === true &&
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
                  "/account/" + encodeURIComponent(encryptPhone(user.phoneNum)),
                mobile: {
                  screen: "Account",
                  slug: user.phoneNum,
                },
              },
            };
            await addNotification(msg, "");
          }

          let u = await prisma.user.update({
            where: {
              id: user.id,
            },
            data: data,
          });
          return res.status(200).json(Success);
        } else {
          return res.status(404).json(NotAvailable);
        }
      } else {
        return res.status(400).json(BadRequest);
      }

    case "DELETE":
      if (
        (session &&
          (session.role === Role.Admin ||
            session.role === Role.Staff ||
            session.role === Role.SuperAdmin)) ||
        (session && id && session.id === id)
      ) {
        if (type === RoleNav.Subscribe && id) {
          if (
            session.role === Role.Staff &&
            !hasPermission(session, SubscribePermission.subscribeDeleteAllow)
          ) {
            return res.status(401).json(Unauthorized);
          }
          await prisma.subscribe.delete({
            where: {
              id: id.toString(),
            },
          });
          return res.status(200).json(Success);
        } else if (id) {
          let d = await deleteUser(id?.toString(), session);
          if (d.success === true) {
            return res.status(200).json(Success);
          } else {
            if (d.status) {
              return res.status(401).json(d.data);
            } else {
              return res.status(400).json(d.data);
            }
          }
        } else {
          return res.status(400).json(BadRequest);
        }
      } else {
        return res.status(401).json(Unauthorized);
      }
    default:
      return res.status(405).json(NotAvailable);
  }
}
