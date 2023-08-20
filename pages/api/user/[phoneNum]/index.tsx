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
import { decrypt, encrypt, encryptPhone } from "@/util/encrypt";
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
import { Brand, NotiType, Role, User } from "@prisma/client";
import { isInternal, isSeller } from "@/util/authHelper";
import {
  addNotification,
  getAdminIdList,
  getStaffIdList,
} from "@/util/notiHelper";

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
        let user = await getUserByPhone(phoneNum.toString());
        if (user) {
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

          if (isSeller(user) && user.membershipId !== profile.membershipId) {
            let adminList = await getAdminIdList();
            let staffList = await getStaffIdList(
              user.role === Role.Seller
                ? SellerPermission.sellerNotiAllow
                : user.role === Role.Trader
                ? TraderPermission.traderNotiAllow
                : ""
            );

            let msg: any = {
              body: "Membership for " + user.username + " was updated",
              createdAt: new Date().toISOString(),
              title: "Membership Updated",
              type: NotiType.UpdateMembership,
              requireInteraction: false,
              sendList: [...adminList, ...staffList],
              details: {
                web:
                  "/account/" + encodeURIComponent(encryptPhone(user.phoneNum)),
              },
            };
            await addNotification(msg, "");
          }

          if (
            isInternal(session) &&
            profile.sellAllow === true &&
            user.sellAllow === false
          ) {
            let adminList = await getAdminIdList();
            let staffList = await getStaffIdList(
              user.role === Role.Seller
                ? SellerPermission.sellerNotiAllow
                : user.role === Role.Trader
                ? TraderPermission.traderNotiAllow
                : ""
            );

            let msg: any = {
              body:
                user.username +
                ", you can now list your products to sell on Marketplace.",
              createdAt: new Date().toISOString(),
              title: "Approved Membership",
              type: NotiType.UpdateMembership,
              requireInteraction: false,
              sendList: [...adminList, ...staffList, user.id],
              details: {
                web:
                  "/account/" + encodeURIComponent(encryptPhone(user.phoneNum)),
                mobile: {
                  screen: "Account",
                  slug: user.phoneNum,
                },
              },
            };
            console.log("Fire");
            await addNotification(msg, "");
          }

          if (profile.email) {
            profile.email = profile.email.toLowerCase();
          }

          let updateUserRes = await updateUser(user.id, profile);
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
