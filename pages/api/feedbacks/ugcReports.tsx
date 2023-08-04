// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import {
  BadRequest,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { otherPermission } from "@/types/permissionTypes";
import {
  addNotification,
  getAdminIdList,
  getStaffIdList,
} from "@/util/notiHelper";

import { canAccess } from "@/util/roleHelper";
import { FeedbackType, NotiType, Role } from "@prisma/client";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

async function getRatings(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let feedbacks: any = await prisma.feedback.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        product: {
          include: {
            seller: true,
          },
        },
        user: true,
      },
    });
    for (let i = 0; i < feedbacks.length; i++) {
      let user = undefined;
      if (feedbacks[i].feedbackType === FeedbackType.User) {
        user = await prisma.user.findFirst({
          where: { id: feedbacks[i].sellerId },
        });
        feedbacks[i].seller = user;
      }
    }
    return res.status(200).json(feedbacks);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
}

async function addRatings(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let body: any = {};
    if (typeof req.body === "object") {
      body = req.body;
    } else {
      body = JSON.parse(req.body);
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    if (session) {
      let feedback = await prisma.feedback.create({
        data: {
          productId: body.productId,
          details: body.details,
          feedbackType: body.feedbackType,
          reasons: body.reasons,
          userId: session.id,
          sellerId: body.sellerId,
        },
        include: {
          user: true,
          product: true,
        },
      });

      let user = undefined;

      if (body.feedbackType === FeedbackType.User) {
        user = await prisma.user.findFirst({
          where: {
            id: body.sellerId,
          },
        });
      }

      let adminList = await getAdminIdList();
      let staffList = await getStaffIdList(otherPermission.feedbacksView);

      let feedbackTitle =
        body.feedbackType === FeedbackType.User && body.sellerId
          ? user.username
          : feedback.product.name;

      let msg: any = {
        body:
          feedback.user.username + " provides feedback for " + +feedbackTitle,
        createdAt: new Date().toISOString(),
        title: "New Feedback",
        type: NotiType.Feedback,
        requireInteraction: false,
        sendList: [...adminList, ...staffList],
        details: {
          web: "/feedbacks/UGC",
        },
      };
      await addNotification(msg, "");

      return res.status(200).json(Success);
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
}

async function deleteRatings(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let { id } = req.query;
    let allowPermission = await canAccess(req, otherPermission.feedbacksDelete);
    if (allowPermission === false) {
      return res.status(401).json(Unauthorized);
    }
    if (id) {
      const data = await prisma.feedback.delete({
        where: {
          id: id.toString(),
        },
      });
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
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useAuth(req);
  const { id, type } = req.query;
  try {
    if (req.method === "POST") {
      return addRatings(req, res);
    }
    switch (req.method) {
      case "GET":
        if (id && type) {
          let feedback = await prisma.feedback.findFirst({
            where: {
              userId: session.id,
              OR: [
                {
                  productId: id.toString(),
                },
                {
                  sellerId: id.toString(),
                },
              ],
            },
          });
          if (feedback) {
            return res.status(200).json({
              feedback: feedback,
              canReport: true,
            });
          } else {
            let order = undefined;
            if (type === FeedbackType.Product) {
              let orderList = await prisma.order.findMany({
                where: {
                  orderByUserId: session.id,
                },
              });
              if (
                orderList.find((z) =>
                  z.cartItems.find((b: any) => b.productId === id)
                )
              ) {
                order = orderList.find((z) =>
                  z.cartItems.find((b: any) => b.productId === id)
                );
              }

              return res.status(200).json({
                feedback: undefined,
                canReport: order ? true : false,
              });
            } else if (type === FeedbackType.User) {
              order = await prisma.order.findFirst({
                where: {
                  OR: [
                    { orderByUserId: id.toString() },
                    {
                      sellerIds: {
                        has: id.toString(),
                      },
                    },
                  ],
                },
              });
              return res.status(200).json({
                feedback: undefined,
                canReport: order ? true : false,
              });
            } else {
              return res.status(400).json(BadRequest);
            }
          }
        } else {
          if (
            session &&
            (session.role === Role.Admin ||
              session.role === Role.SuperAdmin ||
              session.role === Role.Staff)
          ) {
            return getRatings(req, res);
          } else {
            return res.status(401).json(Unauthorized);
          }
        }
      case "DELETE":
        if (
          session &&
          (session.role === Role.Admin ||
            session.role === Role.Staff ||
            session.role === Role.SuperAdmin)
        ) {
          return deleteRatings(req, res);
        } else {
          return res.status(401).json(Unauthorized);
        }
      default:
        return res.status(405).json(NotAvailable);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
