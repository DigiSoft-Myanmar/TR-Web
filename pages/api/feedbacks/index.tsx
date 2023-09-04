// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import {
  BadRequest,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { otherPermission } from "@/types/permissionTypes";
import {
  addNotification,
  getAdminIdList,
  getStaffIdList,
} from "@/util/notiHelper";
import { canAccess } from "@/util/roleHelper";
import { NotiType, Role } from "@prisma/client";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

async function getContact(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    if (
      session &&
      (session.role === Role.Admin ||
        session.role === Role.Staff ||
        session.role === Role.SuperAdmin)
    ) {
      let allowPermission = await canAccess(
        req,
        otherPermission.helpCenterMessageView
      );
      if (allowPermission === false) {
        return res.status(401).json(Unauthorized);
      }
      const data = await prisma.helpMessage.findMany({
        include: {
          solvedBy: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json(data);
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    res.status(400).json(err);
  }
}

async function addContact(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let { token } = req.query;
    let data: any = {};
    if (typeof req.body === "object") {
      data = req.body;
    } else {
      data = JSON.parse(req.body);
    }
    await prisma.helpMessage.create({ data: data });

    let adminList = await getAdminIdList();
    let staffList = await getStaffIdList(otherPermission.helpCenterMessageNoti);

    let msg: any = {
      body: data.message,
      createdAt: new Date().toISOString(),
      title: "New Message from " + data.email,
      type: NotiType.ContactMsg,
      requireInteraction: false,
      sendList: [...adminList, ...staffList],
    };

    await addNotification(msg, token);

    res.status(200).json(Success);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
}

async function updateMessage(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { id } = req.query;
    let allowPermission = await canAccess(
      req,
      otherPermission.helpCenterMessageUpdate
    );
    if (allowPermission === false) {
      return res.status(401).json(Unauthorized);
    }
    if (id) {
      let data = JSON.parse(req.body);
      let dbData = await prisma.helpMessage.findFirst({
        where: { id: id.toString() },
      });
      if (dbData) {
        await prisma.helpMessage.update({
          where: { id: id.toString() },
          data: {
            isSolved: data.isSolved,
            solution: data.solution,
          },
        });

        return res.status(200).json(Success);
      } else {
        return res.status(404).json(NotAvailable);
      }
    } else {
      return res.status(400).json(BadRequest);
    }
  } catch (err) {
    res.status(400).json(err);
  }
}

async function deleteMessage(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { id } = req.query;
    let allowPermission = await canAccess(
      req,
      otherPermission.helpCenterMessageDelete
    );
    if (allowPermission === false) {
      return res.status(401).json(Unauthorized);
    }
    if (id) {
      await prisma.helpMessage.delete({
        where: {
          id: id.toString(),
        },
      });
      return res.status(200).json(Success);
    } else {
      return res.status(400).json(BadRequest);
    }
  } catch (err) {
    res.status(400).json(err);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useAuth(req);
  if (req.method === "POST") {
    return addContact(req, res);
  }
  if (
    session &&
    (session.role === Role.Admin ||
      session.role === Role.SuperAdmin ||
      session.role === Role.Staff)
  ) {
    switch (req.method) {
      case "GET":
        return getContact(req, res);
      case "PUT":
        return updateMessage(req, res);
      case "DELETE":
        return deleteMessage(req, res);
      default:
        return res.status(405).json(NotAvailable);
    }
  } else {
    return res.status(401).json(Unauthorized);
  }
}
