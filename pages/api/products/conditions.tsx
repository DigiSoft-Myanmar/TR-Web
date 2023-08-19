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
import {
  ConditionPermission,
  ProductPermission,
} from "@/types/permissionTypes";
import { hasPermission, isInternal } from "@/util/authHelper";
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

    if (req.method === "GET") {
      let includeData: any = {
        Product: true,
      };
      if (isInternal(session)) {
        includeData = {
          Product: true,
        };
      }
      let manufacture: any = await prisma.condition.findMany({
        include: includeData,
      });
      for (let i = 0; i < manufacture.length; i++) {
        manufacture[i].prodCount = manufacture[i].Product.length;
      }

      return res.status(200).json(manufacture);
    }

    if (isInternal(session)) {
      switch (req.method) {
        case "POST":
          if (
            hasPermission(session, ConditionPermission.conditionCreateAllow)
          ) {
            let newData = JSON.parse(req.body);
            let exists = await prisma.condition.findFirst({
              where: {
                name: newData.name,
              },
            });
            if (exists) {
              return res.status(400).json(AlreadyExists);
            } else {
              let term = await prisma.condition.create({
                data: newData,
              });
              return res.status(200).json(term);
            }
          } else {
            return res.status(401).json(Unauthorized);
          }

        case "PUT":
          if (
            hasPermission(session, ConditionPermission.conditionUpdateAllow)
          ) {
            let data = JSON.parse(req.body);
            if (data.id) {
              delete data.id;
            }
            if (id) {
              let newTerm = await prisma.condition.update({
                where: {
                  id: id.toString(),
                },
                data: data,
              });
              return res.status(200).json(newTerm);
            } else {
              return res.status(400).json(BadRequest);
            }
          } else {
            return res.status(401).json(Unauthorized);
          }
        case "DELETE":
          if (
            hasPermission(session, ConditionPermission.conditionDeleteAllow)
          ) {
            if (id) {
              let manufacture = await prisma.condition.findFirst({
                where: {
                  id: id.toString(),
                },
                include: {
                  Product: true,
                },
              });
              if (manufacture) {
                if (manufacture.Product.length > 0) {
                  return res.status(400).json(Exists);
                } else {
                  await prisma.condition.delete({
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
          } else {
            return res.status(401).json(Unauthorized);
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
