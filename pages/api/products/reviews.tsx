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
import { Role } from "@prisma/client";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

async function getRatings(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { startDate, endDate, allow, productId } = req.query;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    if (productId) {
      const data = await prisma.review.findMany({
        where: {
          productId: productId.toString(),
        },
        include: {
          createdBy: true,
        },
      });
      return res.status(200).json(data);
    } else {
      let filter: {} = {};
      if (startDate && endDate) {
        filter = {
          ...filter,
          updatedDate: {
            $gte: startDate,
            $lte: endDate,
          },
        };
      }
      if (allow && allow.toString() === "true") {
      } else {
        let allowPermission = await canAccess(req, otherPermission.reviewView);
        if (allowPermission === false) {
          return res.status(401).json(Unauthorized);
        }
      }

      const data = await prisma.review.findMany({
        where: filter,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          product: {
            include: {
              seller: true,
              categories: true,
            },
          },
          createdBy: true,
        },
      });

      return res.status(200).json(data);
    }
  } catch (err) {
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
      let data = await prisma.review.findFirst({
        where: {
          productId: body.productId,
          createdByUserId: session.id,
        },
      });

      if (data) {
        await prisma.review.update({
          where: {
            id: body.id,
          },
          data: {
            rating: body.rating,
            message: body.message,
          },
        });
      } else {
        await prisma.review.create({
          data: {
            rating: body.rating,
            productId: body.productId,
            createdByUserId: session.id,
            message: body.message,
          },
        });
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
    let allowPermission = await canAccess(req, otherPermission.reviewDelete);
    if (allowPermission === false) {
      return res.status(401).json(Unauthorized);
    }
    if (id) {
      const data = await prisma.review.delete({
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

  switch (req.method) {
    case "GET":
      return getRatings(req, res);
    case "POST":
      return addRatings(req, res);
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
