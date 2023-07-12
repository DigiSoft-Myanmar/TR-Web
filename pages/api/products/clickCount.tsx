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
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

async function addProductClick(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let db = (await clientPromise).db();
    const { productId, ip: queryIp } = req.query;
    if (productId && queryIp) {
      let b = {
        address: queryIp!.toString(),
        clickedDate: new Date().toLocaleDateString("en-ca"),
        productId: productId.toString(),
      };
      // eslint-disable-next-line react-hooks/rules-of-hooks
      let session = await useAuth(req);

      if (
        session &&
        (session.role === Role.Admin ||
          session.role === Role.Staff ||
          session.role === Role.SuperAdmin ||
          session.role === Role.Seller)
      ) {
      } else {
        let isExists = await prisma.productView.findFirst({
          where: b,
        });
        if (isExists) {
        } else {
          await prisma.productView.create({
            data: b,
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
      return addProductClick(req, res);
    default:
      return res.status(405).json(NotAvailable);
  }
}
