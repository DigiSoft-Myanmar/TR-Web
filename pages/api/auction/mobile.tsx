import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import {
  BadRequest,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { isBuyer } from "@/util/authHelper";
import { getDevice } from "@/util/getDevice";
import e from "express";
import { NextApiRequest, NextApiResponse } from "next";

async function getAuctionList(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { lastTime, productId } = req.query;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session: any = await useAuth(req);
    if (productId) {
      if (lastTime) {
        const auctionInfo = await prisma.auctions.findMany({
          where: {
            createdAt: {
              gte: new Date(lastTime.toString()).toISOString(),
            },
            productId: productId.toString(),
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        return res.status(200).json({ newAuctions: auctionInfo });
      } else {
        return res.status(404).json(NotAvailable);
      }
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
}

async function addBid(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session: any = await useAuth(req);
    if (session && isBuyer(session)) {
      let body: any = {};
      if (typeof req.body === "object") {
        body = req.body;
      } else {
        body = JSON.parse(req.body);
      }

      await prisma.auctions.create({
        data: {
          amount: body.amount,
          SKU: body.SKU,
          createdByUserId: session.id,
          productId: body.productId,
        },
      });
      return res.status(200).json(Success);
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    console.log(err);

    return res.status(400).json(err);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useAuth(req);
  if (session) {
    switch (req.method) {
      case "GET": {
        return getAuctionList(req, res);
      }
      case "POST": {
        return addBid(req, res);
      }
      default:
        return res.status(405).json(NotAvailable);
    }
  } else {
    return res.status(401).json(Unauthorized);
  }
}