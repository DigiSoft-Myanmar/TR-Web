import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import { NotAvailable, Success, Unauthorized } from "@/types/ApiResponseTypes";
import { isBuyer } from "@/util/authHelper";
import { Role } from "@prisma/client";
import { ObjectId } from "mongodb";

import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

async function getWishedItems(req: NextApiRequest, res: NextApiResponse<any>) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useAuth(req);
  if (isBuyer(session)) {
    const wishedItems = await prisma.wishedItems.findFirst({
      where: {
        userId: session.id,
        products: {
          every: {
            isPublished: true,
          },
        },
      },
      include: {
        products: {
          include: {
            Brand: true,
            categories: true,
          },
        },
      },
    });
    if (wishedItems) {
      return res.status(200).json(wishedItems);
    } else {
      return res.status(200).json([]);
    }
  } else {
    return res.status(200).json([]);
  }
}

async function modifyWishedList(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useAuth(req);
  if (session) {
    let body: any = {};
    if (typeof req.body === "object") {
      body = req.body;
    } else {
      body = JSON.parse(req.body);
    }

    await prisma.wishedItems.upsert({
      where: {
        userId: session.id,
      },
      create: {
        productIds: body.productIds,
        userId: session.id,
      },
      update: {
        productIds: body.productIds,
      },
    });
    return res.status(200).json(Success);
  } else {
    return res.status(401).json(Unauthorized);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  switch (req.method) {
    case "GET": {
      return getWishedItems(req, res);
    }
    case "POST": {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const session = await useAuth(req);
      if (isBuyer(session)) {
        return modifyWishedList(req, res);
      } else {
        return res.status(401).json(Unauthorized);
      }
    }
    default:
      return res.status(405).json(NotAvailable);
  }
}
