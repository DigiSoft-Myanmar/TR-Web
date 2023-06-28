// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import {
  BadPromoCode,
  BadRequest,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { otherPermission } from "@/types/permissionTypes";
import { canAccess } from "@/util/roleHelper";
import { isTodayBetween } from "@/util/verify";
import { Role } from "@prisma/client";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

async function getPromotions(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    let session = await useAuth(req);
    const { sellerId } = req.query;
    let allowPermission = await canAccess(req, otherPermission.promotionView);
    if (allowPermission === false) {
      return res.status(401).json(Unauthorized);
    }
    let date = new Date();

    let filter = {};

    if (
      session &&
      (session.role === Role.Admin ||
        session.role === Role.Staff ||
        session.role === Role.SuperAdmin)
    ) {
      filter = {};
    } else {
      filter = {
        sellerId: sellerId?.toString(),
      };
    }

    let data: any = await prisma.promoCode.findMany({
      where: filter,
      include: {
        seller: true,
        Order: true,
      },
    });

    data = data.filter((z) =>
      z.startDate && z.endDate ? isTodayBetween(z.startDate, z.endDate) : true
    );

    for (let i = 0; i < data.length; i++) {
      data[i].usage = data[i].Order.length;
      if (session) {
        data[i].ownUsage = data[i].Order.filter(
          (z) => z.orderByUserId === session.id
        ).length;
      }
      if (data[i].Order) {
        delete data[i].Order;
      }
    }

    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
}

async function addPromotion(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let allowPermission = await canAccess(req, otherPermission.promotionCreate);
    if (allowPermission === false) {
      return res.status(401).json(Unauthorized);
    }
    let data = JSON.parse(req.body);
    data.promoCode = data.promoCode.toLowerCase();
    let promo = await prisma.promoCode.findFirst({
      where: { promoCode: data.promoCode },
    });

    console.log(data);
    if (promo) {
      return res.status(400).json(BadPromoCode);
    } else {
      await prisma.promoCode.create({
        data: data,
      });
      return res.status(200).json(Success);
    }
  } catch (err) {
    console.log(err);

    res.status(400).json(err);
  }
}

async function updatePromotion(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let data = JSON.parse(req.body);
    let { id } = req.query;
    let allowPermission = await canAccess(req, otherPermission.promotionUpdate);
    if (allowPermission === false) {
      return res.status(401).json(Unauthorized);
    }

    if (id) {
      await prisma.promoCode.update({
        where: { id: id.toString() },
        data: data,
      });
      return res.status(200).json(Success);
    } else {
      return res.status(400).json(BadRequest);
    }
  } catch (err) {
    res.status(400).json(err);
  }
}

async function deletePromotion(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let allowPermission = await canAccess(req, otherPermission.promotionDelete);
    if (allowPermission === false) {
      return res.status(401).json(Unauthorized);
    }
    let { id } = req.query;
    if (id) {
      await prisma.promoCode.delete({
        where: { id: id.toString() },
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
      return getPromotions(req, res);
    case "POST":
      if (
        session &&
        (session.role === Role.Admin ||
          session.role === Role.Staff ||
          session.role === Role.SuperAdmin)
      ) {
        return addPromotion(req, res);
      } else {
        return res.status(401).json(Unauthorized);
      }
    case "PUT":
      if (
        session &&
        (session.role === Role.Admin ||
          session.role === Role.Staff ||
          session.role === Role.SuperAdmin)
      ) {
        return updatePromotion(req, res);
      } else {
        return res.status(401).json(Unauthorized);
      }
    case "DELETE":
      if (
        session &&
        (session.role === Role.Admin ||
          session.role === Role.Staff ||
          session.role === Role.SuperAdmin)
      ) {
        return deletePromotion(req, res);
      } else {
        return res.status(401).json(Unauthorized);
      }
    default:
      return res.status(405).json(NotAvailable);
  }
}
