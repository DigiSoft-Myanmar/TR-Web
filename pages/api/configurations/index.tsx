// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import {
  getConfiguration,
  modifyConfiguration,
} from "@/prisma/models/configuration";
import { getAllUser } from "@/prisma/models/user";
import { NotAvailable, Unauthorized } from "@/types/ApiResponseTypes";
import { encrypt } from "@/util/encrypt";
import { Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    switch (req.method) {
      case "GET":
        let configuration = await getConfiguration();
        let d: any = {
          lowStockLimit: 10,
          maximumAuctionPeriod: 14,
          androidSellAllow: false,
          iosSellAllow: false,
          currentVersion: "",
        };
        if (configuration) {
          d = {
            lowStockLimit: configuration.lowStockLimit,
            maximumAuctionPeriod: configuration.maximumAuctionPeriod,
            androidSellAllow: configuration.androidSellAllow,
            iosSellAllow: configuration.iosSellAllow,
            currentVersion: configuration.currentVersion,
          };
        }
        return res.status(200).json(d);
      case "POST":
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const session = await useAuth(req);

        if (
          session &&
          (session.role === Role.Admin || session.role === Role.SuperAdmin)
        ) {
          let data = JSON.parse(req.body);
          if (
            data.senderEmailPassword &&
            typeof data.senderEmailPassword === "string"
          ) {
            data.senderEmailPassword = encrypt(data.senderEmailPassword);
          }
          let update = await modifyConfiguration(data);
          return res.status(200).json(update);
        } else {
          return res.status(401).json(Unauthorized);
        }
      default:
        return res.status(405).json(NotAvailable);
    }
  } catch (err) {
    console.log(err);
  }
}
