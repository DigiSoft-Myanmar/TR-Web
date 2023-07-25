import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { uploadFiles, uploadFilesMiddleware } from "@/util/upload";
import clientPromise from "@/lib/mongodb";
import { getSession } from "next-auth/react";
import {
  BadMembership,
  BadRequest,
  InvalidMembership,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { decrypt, encrypt } from "@/util/encrypt";
import useAuth from "@/hooks/useAuth";
import { ObjectId } from "mongodb";
import { canAccess } from "@/util/roleHelper";
import {
  BuyerPermission,
  SellerPermission,
  StaffPermission,
  TraderPermission,
} from "@/types/permissionTypes";
import { Db } from "mongodb";
import { getUserByPhone, updateUser } from "@/prisma/models/user";
import { Brand, Role, User } from "@prisma/client";

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
  const session = await useAuth(req);
  const { phoneNum } = req.query;
  if (
    (session && session.phoneNum === phoneNum) ||
    (session &&
      (session.role === Role.Admin ||
        session.role === Role.Staff ||
        session.role === Role.SuperAdmin))
  ) {
    if (phoneNum && reqData) {
      let filesData = req.files;
      try {
        const db = (await clientPromise).db();
        let u = await getUserByPhone(phoneNum.toString());
        if (u) {
          filesData.forEach(async (element) => {
            let data: any = { ...element };
            data.createdBy = session.user;
            await db.collection("gallery").insertOne(data);
          });
          let profile: any = reqData.user;
          let imgList: any = reqData.img;

          if (imgList[0]) {
            if (imgList[0].type === "profile" && filesData[0]) {
              profile.profile = filesData[0].filename;
            } else if (imgList[0].type === "nrcFront" && filesData[0]) {
              profile.nrcFront = filesData[0].filename;
            } else if (imgList[0].type === "nrcBack" && filesData[0]) {
              profile.nrcBack = filesData[0].filename;
            }
          }
          if (imgList[1]) {
            if (imgList[1].type === "nrcFront" && filesData[1]) {
              profile.nrcFront = filesData[1].filename;
            } else if (imgList[1].type === "nrcBack" && filesData[1]) {
              profile.nrcBack = filesData[1].filename;
            }
          }
          if (imgList[2]) {
            if (imgList[2].type === "nrcBack" && filesData[2]) {
              profile.nrcBack = filesData[2].filename;
            }
          }

          if (profile.id) {
            delete profile.id;
          }
          if (profile.createdAt) {
            delete profile.createdAt;
          }
          if (profile.updatedAt) {
            delete profile.updatedAt;
          }
          if (profile.state) {
            delete profile.state;
          }
          if (profile.district) {
            delete profile.district;
          }
          if (profile.township) {
            delete profile.township;
          }
          if (profile.Membership) {
            delete profile.Membership;
          }
          let updateUserRes = await updateUser(u.id, profile);
          if (updateUserRes.isSuccess === true) {
            res.status(200).json(Success);
          } else {
            res.status(400).json({ error: updateUserRes.error });
          }
        }
      } catch (err: any) {
        console.log(err);
        res.status(400).json(err);
      }
    } else {
      res.status(400).json(BadRequest);
    }
  } else {
    res.status(401).json(Unauthorized);
  }
});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
export default apiRoute;
