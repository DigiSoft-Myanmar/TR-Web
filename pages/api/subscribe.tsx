// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import { AlreadyExists, NotAvailable, Success } from "@/types/ApiResponseTypes";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  try {
    switch (req.method) {
      case "GET":
        // eslint-disable-next-line react-hooks/rules-of-hooks
        let session = await useAuth(req);
        break;
      case "POST":
        let body = JSON.parse(req.body);
        let exists = await prisma.subscribe.findFirst({
          where: {
            email: body.email,
          },
        });
        if (exists) {
          return res.status(400).json(AlreadyExists);
        } else {
          await prisma.subscribe.create({
            data: {
              email: body.email,
            },
          });
          return res.status(200).json(Success);
        }
      case "DELETE":
        break;
      default:
        return res.status(501).json(NotAvailable);
    }
  } catch (err) {}
}
