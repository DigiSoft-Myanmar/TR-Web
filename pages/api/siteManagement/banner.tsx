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
  res: NextApiResponse<any>,
) {
  try {
    if (req.method === "GET") {
      let banner = await prisma.banner.findMany({
        orderBy: { index: "asc" },
      });
      return res.status(200).json(banner);
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
          await prisma.banner.create({
            data: {
              bannerText: body.bannerText,
              bannerTextMM: body.bannerTextMM,
              index: body.index,
            },
          });
          return res.status(200).json(Success);
        case "PUT":
          if (id) {
            let body = JSON.parse(req.body);
            await prisma.banner.update({
              where: {
                id: id.toString(),
              },
              data: {
                bannerText: body.bannerText,
                bannerTextMM: body.bannerTextMM,
                index: body.index,
              },
            });
            return res.status(200).json(Success);
          } else {
            return res.status(400).json(BadRequest);
          }
        case "DELETE":
          if (id) {
            await prisma.banner.delete({
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
