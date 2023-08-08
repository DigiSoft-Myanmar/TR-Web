// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import { Role } from "@prisma/client";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

let test: any = undefined;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    if (req.method === "POST") {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const session = await useAuth(req);

      if (!session) {
        return res.status(401);
      }
      if (
        session.role === Role.Admin ||
        session.role === Role.Staff ||
        session.role === Role.SuperAdmin
      ) {
        let reqData: any = {};
        if (req.body && req.body) {
          reqData = JSON.parse(req.body);
        }
        const db = (await clientPromise).db();

        let gallery = await db.collection("gallery").deleteMany({
          id: {
            $in: reqData.map((e: any) => new ObjectId(e.id)),
          },
        });
        let files = await db.collection("photos.files").deleteMany({
          _id: {
            $in: reqData.map((e: any) => new ObjectId(e.id)),
          },
        });
        let chunks = await db.collection("photos.chunks").deleteMany({
          files_id: {
            $in: reqData.map((e: any) => new ObjectId(e.id)),
          },
        });
        console.log(gallery, files, chunks);
        return res.status(200).json(gallery);
      } else {
        return res.status(401);
      }
    } else {
      return res.status(405);
    }
  } catch (err) {
    console.log(err);
  }
}
