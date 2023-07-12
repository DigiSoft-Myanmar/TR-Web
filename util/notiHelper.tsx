import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import { Role } from "@prisma/client";
import { ObjectId } from "mongodb";
import { Notification } from "@/models/notification";
import { sendFCMMessage } from "@/lib/firebaseAdmin";
import { isEqual } from "lodash";

const mongoose = require("mongoose");
mongoose.connect(process.env.NEXT_PUBLIC_MONGODB_URI);

export async function getAdminIdList() {
  let adminList = await prisma.user.findMany({
    where: {
      OR: [{ role: Role.Admin }, { role: Role.SuperAdmin }],
    },
  });

  let adminIdList = adminList
    .filter(
      (e) =>
        (e.isBlocked === false || e.isBlocked === null) &&
        (e.isDeleted === false || e.isDeleted === null)
    )
    .map((e) => e.id.toString());
  return adminIdList;
}

export async function getStaffIdList(permission: any) {
  let idList: any = [];
  let users = await prisma.user.findMany({
    where: {
      role: Role.Staff,
      userDefinedRole: {
        permission: {
          has: permission,
        },
      },
    },
  });
  idList = [...idList, ...users.map((e) => e.id.toString())];
  return Array.from(new Set(idList));
}

export async function getAdminEmailList() {
  let adminList = await prisma.user.findMany({
    where: {
      OR: [{ role: Role.Admin }, { role: Role.SuperAdmin }],
      email: {
        isSet: true,
      },
    },
  });

  let adminEmailList = adminList
    .filter(
      (e) =>
        (e.isBlocked === false || e.isBlocked === null) &&
        (e.isDeleted === false || e.isDeleted === null)
    )
    .map((e) => e.email.toString());
  return adminEmailList;
}

export async function getStaffEmailList(permission: any) {
  let idList: any = [];
  let users = await prisma.user.findMany({
    where: {
      role: Role.Staff,
      userDefinedRole: {
        permission: {
          has: permission,
        },
      },
      email: {
        isSet: true,
      },
    },
  });
  idList = [...idList, ...users.map((e) => e.email!.toString())];
  return Array.from(new Set(idList));
}

export async function getStaffAllList(permission: any) {
  let users = await prisma.user.findMany({
    where: {
      role: Role.Staff,
      userDefinedRole: {
        permission: {
          has: permission,
        },
      },
    },
  });
  return Array.from(new Set(users));
}

export async function addNotification(msg: any, token?: any) {
  let sameNoti = await Notification.find({
    title: msg.title,
    body: msg.body,
    type: msg.type,
  });
  let msgCount = sameNoti.filter((e: any) =>
    isEqual(e.sendList.sort(), msg.sendList.sort())
  ).length;
  let response = [];

  if (msgCount > 0) {
  } else {
    if (msg && msg.sendList && msg.sendList.length > 0) {
      for (let i = 0; i < msg.sendList.length; i++) {
        let user = await prisma.user.findFirst({
          where: {
            id: msg.sendList[i],
          },
          include: {
            NotiToken: true,
          },
        });
        if (user) {
          if (user.NotiToken) {
            if (user.NotiToken.length > 0) {
              let res = await fetch("https://exp.host/--/api/v2/push/send", {
                method: "POST",
                body: JSON.stringify({
                  to: user.NotiToken[user.NotiToken.length - 1]
                    .notificationToken,
                  title: msg.title,
                  body: msg.body,
                }),
              });
              response.push(res);
            }
          }
        }
      }
    } else {
      let tokens = await prisma.notiToken.findMany({});
      for (let i = 0; i < tokens.length; i++) {
        let res = fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          body: JSON.stringify({
            to: tokens[i].notificationToken,
            title: msg.title,
            body: msg.body,
          }),
        });
        response.push(res);
      }
    }

    if (token) {
      await sendFCMMessage(msg, token.toString());
    }
    let notification = new Notification(msg);
    notification
      .save()
      .then(() => {
        console.log("success");
      })
      .catch((err: any) => {
        console.log(err);
      });
    return response;
  }
}
