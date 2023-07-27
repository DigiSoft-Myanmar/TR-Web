// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import { createTerm, deleteTerm, updateTerm } from "@/prisma/models/product";
import prisma from "@/prisma/prisma";
import {
  AlreadyExists,
  BadRequest,
  Exists,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { isInternal } from "@/util/authHelper";
import { Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let { id } = req.query;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session: any = await useAuth(req);

    if (session) {
      switch (req.method) {
        case "GET":
          let users = await prisma.userDefinedRole.findMany({
            include: {
              User: true,
            },
          });
          return res.status(200).json(users);
        case "POST":
          let newData = JSON.parse(req.body);
          let exists = await prisma.userDefinedRole.findFirst({
            where: {
              name: newData.name,
            },
          });
          if (exists) {
            return res.status(400).json(AlreadyExists);
          } else {
            let term = await prisma.userDefinedRole.create({
              data: newData,
            });
            return res.status(200).json(term);
          }
        case "PUT":
          let data = JSON.parse(req.body);
          if (data.id) {
            delete data.id;
          }
          if (id) {
            let newTerm = await prisma.userDefinedRole.update({
              where: {
                id: id.toString(),
              },
              data: data,
            });
            return res.status(200).json(newTerm);
          } else {
            return res.status(400).json(BadRequest);
          }
        case "DELETE":
          if (id) {
            let manufacture = await prisma.userDefinedRole.findFirst({
              where: {
                id: id.toString(),
              },
              include: {
                User: true,
              },
            });
            if (manufacture) {
              if (manufacture.User.length > 0) {
                return res.status(400).json(Exists);
              } else {
                await prisma.userDefinedRole.delete({
                  where: {
                    id: id.toString(),
                  },
                });
                return res.status(200).json(Success);
              }
            }
            return res.status(404).json(NotAvailable);
          } else {
            return res.status(400).json(BadRequest);
          }
        default:
          return res.status(501).json(Unauthorized);
          break;
      }
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
