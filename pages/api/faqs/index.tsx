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
import { canAccess } from "@/util/roleHelper";
import { Role } from "@prisma/client";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

async function getFAQs(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let allowPermission = await canAccess(req, otherPermission.faqView);
    if (allowPermission === false) {
      return res.status(401).json(Unauthorized);
    }
    const data = await prisma.fAQGroup.findMany({
      include: {
        FAQ: true,
      },
    });
    return res.status(200).json(data);
  } catch (err) {
    res.status(400).json(err);
  }
}

async function addFAQ(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let allowPermission = await canAccess(req, otherPermission.faqCreate);
    if (allowPermission === false) {
      return res.status(401).json(Unauthorized);
    }
    let data = JSON.parse(req.body);
    await prisma.fAQ.create({
      data: data,
    });
    return res.status(200).json(Success);
  } catch (err) {
    res.status(400).json(err);
  }
}

async function updateFAQ(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let allowPermission = await canAccess(req, otherPermission.faqUpdate);
    if (allowPermission === false) {
      return res.status(401).json(Unauthorized);
    }
    const { id } = req.query;
    let data = JSON.parse(req.body);

    if (id) {
      await prisma.fAQ.update({
        where: {
          id: id.toString(),
        },
        data: data,
      });
      return res.status(200).json(Success);
    }
  } catch (err) {
    res.status(400).json(err);
  }
}

async function deleteFAQ(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let allowPermission = await canAccess(req, otherPermission.faqDelete);
    if (allowPermission === false) {
      return res.status(401).json(Unauthorized);
    }

    const { id } = req.query;
    if (id) {
      await prisma.fAQ.delete({
        where: {
          id: id.toString(),
        },
      });
      return res.status(200).json(Success);
    }
  } catch (err) {
    res.status(400).json(err);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useAuth(req);

  switch (req.method) {
    case "GET":
      return getFAQs(req, res);
    case "POST":
      if (
        session &&
        (session.role === Role.Admin ||
          session.role === Role.Staff ||
          session.role === Role.SuperAdmin)
      ) {
        return addFAQ(req, res);
      } else {
        return res.status(401).json(Unauthorized);
      }
    case "PUT":
      if (
        session &&
        (session.role === Role.Admin ||
          session.role === Role.Staff ||
          session.role === Role.SuperAdmin)
      ) {
        return updateFAQ(req, res);
      } else {
        return res.status(401).json(Unauthorized);
      }
    case "DELETE":
      if (
        session &&
        (session.role === Role.Admin ||
          session.role === Role.Staff ||
          session.role === Role.SuperAdmin)
      ) {
        return deleteFAQ(req, res);
      } else {
        return res.status(401).json(Unauthorized);
      }
    default:
      return res.status(405).json(NotAvailable);
  }
}
