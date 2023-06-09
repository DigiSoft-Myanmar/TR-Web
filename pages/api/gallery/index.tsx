import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { uploadFiles, uploadFilesMiddleware } from "@/util/upload";
import clientPromise from "@/lib/mongodb";
import { Success } from "@/types/ApiResponseTypes";
import useAuth from "@/hooks/useAuth";
import { Role } from "@prisma/client";
import { ImgType } from "@/types/orderTypes";
import prisma from "@/prisma/prisma";

export interface NextConnectApiRequest extends NextApiRequest {
  files: Express.Multer.File[];
}

const apiRoute = nextConnect({
  onError(error: any, req: NextConnectApiRequest, res: NextApiResponse<any>) {
    res
      .status(501)
      .json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req: NextConnectApiRequest, res: NextApiResponse<any>) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(uploadFiles.array("theFiles", 10));

apiRoute.post(async (req: NextConnectApiRequest, res: NextApiResponse<any>) => {
  let reqData: any = {};
  if (req.body && req.body.data) {
    reqData = JSON.parse(req.body.data);
  }
  const { type } = req.query;

  const session = await useAuth(req);

  if (session) {
    console.log(session);
    let filesData = req.files;
    try {
      const db = (await clientPromise).db();
      console.log(filesData);

      filesData.forEach(async (element) => {
        let data: any = { ...element };
        data.createdBy = session.id;
        if (reqData && reqData.sellerId) {
          data.sellerId = reqData.sellerId;
        } else if (session.role === Role.Seller) {
          data.sellerId = session.sellerId;
        }
        if (type) {
          data.type = type;
        }
        console.log(data);
        await db.collection("gallery").insertOne(data);
      });
      res.status(200).json({ filesData });
    } catch (err: any) {
      console.log(err);
      res.status(400).json(err);
    }
  } else {
    res.status(401);
  }
});

apiRoute.get(async (req: NextConnectApiRequest, res: NextApiResponse<any>) => {
  try {
    const session = await useAuth(req);

    if (!session) {
      return res.status(401);
    }
    let filter = {};
    const db = (await clientPromise).db();
    const { limit, page, seller, type } = req.query;
    let perPage: number = 10;
    let currentPage: number = 1;
    if (limit) {
      perPage = parseInt(limit.toString());
    }
    if (page) {
      currentPage = parseInt(page.toString());
    }
    if (seller) {
      filter = {
        sellerId: seller.toString(),
      };
    }
    if (session && session.role === Role.Seller) {
      filter = {
        sellerId: session.sellerId,
      };
    }
    if (type && type !== ImgType.Others) {
      filter = {
        ...filter,
        type: type,
      };
    } else {
      filter = {
        ...filter,
        type: { $exists: false },
      };
    }
    let count = await db.collection("gallery").countDocuments(filter);

    let gallery = await db
      .collection("gallery")
      .find(filter, { projection: { _id: 0 } })
      .skip(perPage * (currentPage - 1))
      .limit(perPage)
      .toArray();

    if (type) {
      switch (type) {
        case ImgType.Ads:
          for (let i = 0; i < gallery.length; i++) {
            let fileName = gallery[i].filename;
            let ads = await prisma.ads.findMany({
              where: {
                adsImg: fileName,
              },
            });
            gallery[i].usage = ads;
          }
          break;
        case ImgType.Attribute:
          for (let i = 0; i < gallery.length; i++) {
            let fileName = gallery[i].filename;
            let attrUsage = await prisma.attribute.findMany({
              where: {
                Term: {
                  some: {
                    value: fileName,
                  },
                },
              },
            });
            gallery[i].usage = attrUsage;
          }
          break;
        case ImgType.PromoCode:
          for (let i = 0; i < gallery.length; i++) {
            let fileName = gallery[i].filename;
            let bannerUsage = await prisma.promoCode.findMany({
              where: {
                img: fileName,
              },
            });
            gallery[i].usage = bannerUsage;
          }
          break;
        case ImgType.Category:
          for (let i = 0; i < gallery.length; i++) {
            let fileName = gallery[i].filename;
            let categoryUsage = await prisma.category.findMany({
              where: {
                icon: fileName,
              },
            });
            gallery[i].usage = categoryUsage;
          }
          break;

        case ImgType.Product:
          for (let i = 0; i < gallery.length; i++) {
            let fileName = gallery[i].filename;
            let products = await prisma.product.findMany({
              where: {
                imgList: {
                  has: fileName,
                },
              },
            });
            gallery[i].usage = products;
          }
          break;

        case ImgType.SiteManagement:
          for (let i = 0; i < gallery.length; i++) {
            let fileName = gallery[i].filename;
            let products = await prisma.content.count({
              where: {
                OR: [
                  {
                    homeBannerImg: fileName,
                  },
                  {
                    sellBannerImg: fileName,
                  },
                ],
              },
            });
            gallery[i].usage = products;
          }
          break;
        case ImgType.Others:
          break;
      }
    }

    let data = {
      docs: JSON.parse(JSON.stringify(gallery)),
      totalDocs: count,
      totalPages: Math.ceil(count / perPage),
    };
    return res.status(200).json(JSON.parse(JSON.stringify(data)));
  } catch (error: any) {
    return res.status(500).send({
      message: error.message,
    });
  }
});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
export default apiRoute;
