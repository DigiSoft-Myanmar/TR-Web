import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
const GridFSBucket = require("mongodb").GridFSBucket;

const download = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const database = (await clientPromise).db();
    const bucket = new GridFSBucket(database, {
      bucketName: process.env.NEXT_PUBLIC_IMG_BUCKET,
    });
    const { fileName } = req.query;
    const db = (await clientPromise).db();
    let file = await db
      .collection("photos.files")
      .findOne({ filename: fileName });
    let downloadStream = bucket.openDownloadStreamByName(fileName);
    //res.setHeader('content-Disposition', 'attachment; filename=' + fileName)
    res.setHeader("Content-Type", file!.contentType);

    downloadStream.on("data", function (data: any) {
      return res.write(data);
    });

    downloadStream.on("error", function (err: any) {
      return res.status(404).send({ message: "Cannot download the Image!" });
    });

    downloadStream.on("end", () => {
      return res.status(200).end();
    });
  } catch (error: any) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return download(req, res);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
