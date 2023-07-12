// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import prisma from "@/prisma/prisma";
import {
  BadRequest,
  Exists,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import type { NextApiRequest, NextApiResponse } from "next";
import { Notification } from "@/models/notification";

import { MongoClient, ObjectId } from "mongodb";
import { sortBy } from "lodash";
import { isInternal } from "@/util/authHelper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    let session: any = await useAuth(req);

    if (session) {
      const notifications = await prisma.notification.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      let notiList: any = notifications.filter((z) =>
        z.sendList.includes(session.id)
      );

      return res.status(200).json(
        sortBy(notiList, (e) => e.createdAt)
          .reverse()
          .slice(0, 50)
      );
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
}
