// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import { createTerm, deleteTerm, updateTerm } from "@/prisma/models/product";
import prisma from "@/prisma/prisma";
import {
  AlreadyExists,
  BadRequest,
  Exists,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { isBuyer, isInternal, isSeller } from "@/util/authHelper";
import { ProductType, Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let { phoneNum } = req.query;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (phoneNum) {
      switch (req.method) {
        case "GET":
          let user = await prisma.user.findFirst({
            where: {
              phoneNum: phoneNum.toString(),
            },
          });
          if (user) {
            let ads = await prisma.ads.findMany({
              where: {
                sellerId: user.id,
              },
              include: {
                seller: {
                  include: {
                    currentMembership: true,
                  },
                },
              },
            });
            return res.status(200).json(ads);
          } else {
            return res.status(404).json(NotAvailable);
          }
        default:
          return res.status(501).json(NotAvailable);
      }
    } else {
      return res.status(400).json(BadRequest);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
