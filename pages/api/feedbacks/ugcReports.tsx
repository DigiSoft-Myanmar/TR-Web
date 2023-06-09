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

import { canAccess } from "@/util/roleHelper";
import { FeedbackType, Role } from "@prisma/client";
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
      feedbacks[i].feedbackInfo = {
        type: feedbacks[i].feedbackType,
        info:
          feedbacks[i].feedbackType === FeedbackType.Brand
            ? feedbacks[i].brand
            : feedbacks[i].product,
      };
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
      if (body.productId) {
        let data = await prisma.feedback.findFirst({
          where: {
            productId: body.productId,
            userId: session.id,
          },
        });

        if (data) {
          await prisma.feedback.update({
            where: {
              id: body.id,
            },
            data: body,
          });
        } else {
          await prisma.feedback.create({
            data: body,
          });
        }
      } else if (body.brandId) {
        let data = await prisma.feedback.findFirst({
          where: {
            sellerId: body.brandId,
            userId: session.id,
          },
        });

        if (data) {
          await prisma.feedback.update({
            where: {
              id: body.id,
            },
            data: body,
          });
        } else {
          await prisma.feedback.create({
            data: body,
          });
        }
      }

      return res.status(200).json(Success);
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

  if (req.method === "POST") {
    return addRatings(req, res);
  }
  if (
    session &&
    (session.role === Role.Admin ||
      session.role === Role.SuperAdmin ||
      session.role === Role.Staff)
  ) {
    switch (req.method) {
      case "GET":
        return getRatings(req, res);

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
  }
}
