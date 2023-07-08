import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import { NotAvailable } from "@/types/ApiResponseTypes";
import { Role } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useAuth(req);
  switch (req.method) {
    case "GET": {
      let siteVisit = await prisma.siteVisit.findMany({
        where: {
          user: {
            role: {
              in: [Role.Buyer, Role.Trader],
            },
          },
        },
      });
      return res.status(200).json(siteVisit);
    }
    default:
      return res.status(405).json(NotAvailable);
  }
}
