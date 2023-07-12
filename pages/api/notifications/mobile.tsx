import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import {
  BadRequest,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { getDevice } from "@/util/getDevice";
import e from "express";
import { NextApiRequest, NextApiResponse } from "next";

async function getNotiTime(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { lastTime } = req.query;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session: any = await useAuth(req);
    if (session) {
      let user = await prisma.user.findFirst({
        where: {
          id: session.id,
        },
      });

      if (user && lastTime) {
        const notifications = await prisma.notification.findMany({
          where: {
            createdAt: {
              gte: new Date(lastTime.toString()).toISOString(),
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        return res.status(200).json({ newNotifications: notifications });
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useAuth(req);
  if (session) {
    switch (req.method) {
      case "GET": {
        return getNotiTime(req, res);
      }
      default:
        return res.status(405).json(NotAvailable);
    }
  } else {
    return res.status(401).json(Unauthorized);
  }
}
