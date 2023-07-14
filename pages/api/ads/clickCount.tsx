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
import { Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

async function addAdsClick(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { adsId, ip: queryIp, adsLocation } = req.query;
    if (adsId && queryIp) {
      let b = {
        address: queryIp!.toString(),
        clickedDate: new Date().toLocaleDateString("en-ca"),
        adsId: adsId.toString(),
        adsLocation: adsLocation.toString(),
      };
      // eslint-disable-next-line react-hooks/rules-of-hooks
      let session = await useAuth(req);

      if (
        session &&
        (session.role === Role.Admin ||
          session.role === Role.Staff ||
          session.role === Role.SuperAdmin)
      ) {
      } else {
        let isExists = await prisma.adsClick.findFirst({
          where: b,
        });
        if (isExists) {
        } else {
          await prisma.adsClick.create({
            data: {
              address: queryIp!.toString(),
              clickedDate: new Date().toLocaleDateString("en-ca"),
              adsId: adsId.toString(),
              adsLocation: adsLocation.toString(),
            },
          });
        }
        return res.status(200).json(Success);
      }
    } else {
      return res.status(400).json(BadRequest);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  switch (req.method) {
    case "POST":
      return addAdsClick(req, res);
    default:
      return res.status(405).json(NotAvailable);
  }
}
