// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import {
  BadRequest,
  Exists,
  NotAvailable,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);

    if (session && session.role !== Role.Buyer) {
      let { brandId, SKU, id } = req.query;
      if (brandId && SKU) {
        if (session.role === Role.Seller && session.id !== brandId) {
          return res.status(400).json(BadRequest);
        } else {
          let filter: any = {
            sellerId: brandId?.toString(),
            SKU: SKU?.toString(),
          };
          if (id) {
            filter = {
              ...filter,
              id: {
                not: id?.toString(),
              },
            };
          }
          let prod = await prisma.product.count({
            where: filter,
          });
          if (prod > 0) {
            return res.status(200).json(Exists);
          } else {
            return res.status(404).json(NotAvailable);
          }
        }
      } else {
        return res.status(400).json(BadRequest);
      }
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    console.log(err);
  }
}
