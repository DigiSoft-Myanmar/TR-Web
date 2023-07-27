// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import { createTerm, deleteTerm, updateTerm } from "@/prisma/models/product";
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
  ProductPermission,
  SellerPermission,
  TraderPermission,
} from "@/types/permissionTypes";
import { isBuyer, isInternal, isSeller } from "@/util/authHelper";
import { encryptPhone } from "@/util/encrypt";
import {
  addNotification,
  getAdminIdList,
  getStaffIdList,
} from "@/util/notiHelper";
import { NotiType, ProductType, ReviewType, Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    const { userId, productId, reviewId } = req.query;

    if (session) {
      switch (req.method) {
        case "POST":
          if (userId || productId) {
            let body: any = {};
            if (typeof req.body === "object") {
              body = req.body;
            } else {
              body = JSON.parse(req.body);
            }
            if (userId) {
              const user = await prisma.user.findFirst({
                where: {
                  id: userId?.toString(),
                },
              });
              let adminList = await getAdminIdList();
              let staffList = await getStaffIdList(
                user.role === Role.Seller
                  ? SellerPermission.sellerNotiAllow
                  : user.role === Role.Trader
                  ? TraderPermission.traderNotiAllow
                  : user.role === Role.Buyer
                  ? BuyerPermission.buyerNotiAllow
                  : ""
              );

              let review =
                body.reviewType === ReviewType.Buyer ? "Buyer" : "Seller";

              let reviewType =
                body.reviewType === ReviewType.Buyer
                  ? "buyerRatings"
                  : "sellerRatings";

              let msg: any = {
                body: "New Review with rating: " + body.rating,
                createdAt: new Date().toISOString(),
                title: "New " + review + " Review",
                type: NotiType.NewUserReview,
                requireInteraction: false,
                sendList: [...adminList, ...staffList, userId.toString()],
                details: {
                  web:
                    "/account/" +
                    encodeURIComponent(encryptPhone(user.phoneNum)) +
                    "#" +
                    reviewType,
                  mobile: {
                    screen: "Account",
                    slug: user.phoneNum,
                  },
                },
              };
              await addNotification(msg, "");

              await prisma.review.create({
                data: {
                  rating: body.rating,
                  createdByUserId: session.id,
                  message: body.message,
                  userId: userId?.toString(),
                  reviewType: body.reviewType,
                },
              });
            } else if (productId) {
              let product = await prisma.product.findFirst({
                where: {
                  id: productId.toString(),
                },
              });

              let adminList = await getAdminIdList();
              let staffList = await getStaffIdList(
                ProductPermission.productNotiAllow
              );

              let msg: any = {
                body: "New Review with rating: " + body.rating,
                createdAt: new Date().toISOString(),
                title: "New Product Review",
                type: NotiType.NewProductReview,
                requireInteraction: false,
                sendList: [...adminList, ...staffList, product.sellerId],
                details: {
                  web:
                    "/products/" +
                    encodeURIComponent(product.slug) +
                    "#reviews",
                  mobile: {
                    screen: "Products",
                    slug: product.slug,
                  },
                },
              };
              await addNotification(msg, "");

              await prisma.review.create({
                data: {
                  rating: body.rating,
                  createdByUserId: session.id,
                  message: body.message,
                  productId: productId?.toString(),
                  reviewType: body.reviewType,
                },
              });
            }
            return res.status(200).json(Success);
          } else {
            return res.status(400).json(BadRequest);
          }
        case "PUT":
          if (reviewId) {
            let body: any = {};
            if (typeof req.body === "object") {
              body = req.body;
            } else {
              body = JSON.parse(req.body);
            }
            if (userId) {
              const user = await prisma.user.findFirst({
                where: {
                  id: userId?.toString(),
                },
              });
              let adminList = await getAdminIdList();
              let staffList = await getStaffIdList(
                user.role === Role.Seller
                  ? SellerPermission.sellerNotiAllow
                  : user.role === Role.Trader
                  ? TraderPermission.traderNotiAllow
                  : user.role === Role.Buyer
                  ? BuyerPermission.buyerNotiAllow
                  : ""
              );

              let review =
                body.reviewType === ReviewType.Buyer ? "Buyer" : "Seller";

              let reviewType =
                body.reviewType === ReviewType.Buyer
                  ? "buyerRatings"
                  : "sellerRatings";

              let msg: any = {
                body: "Update Review with rating: " + body.rating,
                createdAt: new Date().toISOString(),
                title: "Update " + review + " Review",
                type: NotiType.UpdateUserReview,
                requireInteraction: false,
                sendList: [...adminList, ...staffList, userId.toString()],
                details: {
                  web:
                    "/account/" +
                    encodeURIComponent(encryptPhone(user.phoneNum)) +
                    "#" +
                    reviewType,
                  mobile: {
                    screen: "Account",
                    slug: user.phoneNum,
                  },
                },
              };
              await addNotification(msg, "");

              await prisma.review.create({
                data: {
                  rating: body.rating,
                  createdByUserId: session.id,
                  message: body.message,
                  userId: userId?.toString(),
                  reviewType: body.reviewType,
                },
              });
            }

            await prisma.review.update({
              where: {
                id: reviewId.toString(),
              },
              data: {
                rating: body.rating,
                createdByUserId: session.id,
                message: body.message,
                userId: userId?.toString(),
                productId: productId?.toString(),
              },
            });
          } else {
            return res.status(400).json(BadRequest);
          }
        default:
          return res.status(501).json(NotAvailable);
      }
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
