// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import {
  AlreadyExists,
  BadRequest,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    if (req.method === "GET") {
      let ads = await prisma.ads.findMany({
        include: {
          seller: {
            include: {
              currentMembership: true,
            },
          },
        },
      });
      return res.status(200).json(ads);
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    if (
      session &&
      (session.role === Role.Admin ||
        session.role === Role.SuperAdmin ||
        session.role === Role.Staff)
    ) {
      let { id } = req.query;
      switch (req.method) {
        case "POST":
          let body = JSON.parse(req.body);
          await prisma.ads.create({
            data: body,
          });
          return res.status(200).json(Success);
        case "PUT":
          if (id) {
            let body = JSON.parse(req.body);
            await prisma.ads.update({
              where: {
                id: id.toString(),
              },
              data: body,
            });
            return res.status(200).json(Success);
          } else {
            return res.status(400).json(BadRequest);
          }
        case "DELETE":
          if (id) {
            await prisma.ads.delete({
              where: {
                id: id.toString(),
              },
            });
            return res.status(200).json(Success);
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
