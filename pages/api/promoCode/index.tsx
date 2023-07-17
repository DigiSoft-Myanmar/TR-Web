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
import { isBuyer, isInternal, isSeller } from "@/util/authHelper";
import { canAccess } from "@/util/roleHelper";
import { isTodayBetween } from "@/util/verify";
import { Role } from "@prisma/client";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

async function getPromotions(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    let session = await useAuth(req);
    const { sellerId, isSeller: isSellerFlag } = req.query;
    let allowPermission = await canAccess(req, otherPermission.promotionView);
    if (allowPermission === false) {
      return res.status(401).json(Unauthorized);
    }
    let filter = {};

    if (
      session &&
      (session.role === Role.Admin ||
        session.role === Role.Staff ||
        session.role === Role.SuperAdmin) &&
      !sellerId
    ) {
      filter = {};
    } else if (sellerId) {
      filter = {
        sellerId: sellerId?.toString(),
      };
    }
    if (isSellerFlag === "true" && isSeller(session)) {
      filter = {
        sellerId: session.id,
      };
    }

    let data: any = await prisma.promoCode.findMany({
      where: filter,
      include: {
        seller: true,
      },
    });

    if (isInternal(session) || (isSellerFlag === "true" && isSeller(session))) {
    } else {
      data = data.filter((z) =>
        z.startDate && z.endDate ? isTodayBetween(z.startDate, z.endDate) : true
      );
    }

    for (let i = 0; i < data.length; i++) {
      let orderCount = await prisma.order.count({
        where: {
          promoIds: {
            has: data[i].id,
          },
        },
      });
      data[i].usage = orderCount;

      if (isBuyer(session)) {
        let ownCount = await prisma.order.count({
          where: {
            promoIds: {
              has: data[i].id,
            },
            orderByUserId: session.id,
          },
        });
        data[i].ownUsage = ownCount;
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
      where: { promoCode: data.promoCode, sellerId: data.sellerId },
    });

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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    let data = JSON.parse(req.body);
    let { id } = req.query;
    let allowPermission = await canAccess(req, otherPermission.promotionUpdate);
    if (allowPermission === false) {
      return res.status(401).json(Unauthorized);
    }
    if (id) {
      if (isSeller(session)) {
        let promo = await prisma.promoCode.findFirst({
          where: { id: id.toString() },
        });
        if (promo.sellerId === session.id) {
          await prisma.promoCode.update({
            where: { id: id.toString() },
            data: data,
          });
        } else {
          return res.status(400).json(BadPromoCode);
        }
      } else {
        await prisma.promoCode.update({
          where: { id: id.toString() },
          data: data,
        });
      }
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
    const session = await useAuth(req);
    let allowPermission = await canAccess(req, otherPermission.promotionDelete);
    if (allowPermission === false) {
      return res.status(401).json(Unauthorized);
    }
    let { id } = req.query;
    if (id) {
      if (isSeller(session)) {
        let promo = await prisma.promoCode.findFirst({
          where: { id: id.toString() },
        });
        if (promo.sellerId === session.id) {
          await prisma.promoCode.delete({
            where: { id: id.toString() },
          });
        } else {
          return res.status(400).json(BadPromoCode);
        }
      } else {
        await prisma.promoCode.delete({
          where: { id: id.toString() },
        });
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
          session.role === Role.SuperAdmin ||
          isSeller(session))
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
          session.role === Role.SuperAdmin ||
          isSeller(session))
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
          session.role === Role.SuperAdmin ||
          isSeller(session))
      ) {
        return deletePromotion(req, res);
      } else {
        return res.status(401).json(Unauthorized);
      }
    default:
      return res.status(405).json(NotAvailable);
  }
}
