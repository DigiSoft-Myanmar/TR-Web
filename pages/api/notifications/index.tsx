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

import { MongoClient } from "mongodb";
import { Notification } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    let session: any = await useAuth(req);
    if (session) {
      if (req.method === "GET") {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const client = await MongoClient.connect(
          process.env.NEXT_PUBLIC_MONGODB_URI!
        );
        const collection = client.db().collection("notifications");

        const stream = collection.watch();

        stream.on("change", (change: any) => {
          let doc: Notification = change.fullDocument;
          const message = JSON.stringify(change.fullDocument);
          if (session && session.id) {
            if (doc.sendList.find((z) => z === session.id)) {
              res.write(`data: ${message}\n\n`);
            }
          } else {
            res.write(`data: ${message}\n\n`);
          }
        });

        req.on("close", () => {
          stream.close();
          client.close();
          res.end();
        });
      } else if (req.method === "PUT") {
        let data: any = {};
        if (typeof req.body === "object") {
          data = req.body;
        } else {
          data = JSON.parse(req.body);
        }
        let token = await prisma.notiToken.findFirst({
          where: {
            notificationToken: data.notificationToken,
            userId: session.id,
          },
        });
        if (token) {
          await prisma.notiToken.update({
            where: {
              id: token.id,
            },
            data: {
              notificationToken: data.notificationToken,
            },
          });
        } else {
          await prisma.notiToken.create({
            data: {
              notificationToken: data.notificationToken,
              userId: session.id,
            },
          });
        }
        return res.status(200).json(Success);
      } else if (req.method === "DELETE") {
        let { token } = req.query;
        if (token) {
          let existsData = await prisma.notiToken.findFirst({
            where: {
              userId: session.id,
              notificationToken: token.toString(),
            },
          });
          if (existsData) {
            await prisma.notiToken.delete({
              where: {
                id: existsData.id,
              },
            });
            return res.status(200).json(Success);
          } else {
            return res.status(404).json(NotAvailable);
          }
        } else {
          return res.status(400).json(BadRequest);
        }
      }
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
}
