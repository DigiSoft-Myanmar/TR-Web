// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import { AlreadyExists, NotAvailable, Success } from "@/types/ApiResponseTypes";
import { Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  try {
    if (req.method === "GET") {
      let legal = await prisma.legal.findFirst({});
      return res.status(200).json(legal);
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    if (
      session &&
      (session.role === Role.Admin ||
        session.role === Role.SuperAdmin ||
        session.role === Role.Staff)
    ) {
      switch (req.method) {
        case "POST":
          let body = JSON.parse(req.body);
          let d = await prisma.legal.findFirst({});
          if (d) {
            await prisma.legal.update({
              where: { id: d.id },
              data: body,
            });
            return res.status(200).json(Success);
          } else {
            await prisma.legal.create({
              data: body,
            });
            return res.status(200).json(Success);
          }
        default:
          return res.status(501).json(NotAvailable);
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
