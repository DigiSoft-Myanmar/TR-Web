// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import {
  createAttribute,
  deleteAttribute,
  getAllAttributes,
  getAllCategories,
  updateAttribute,
} from "@/prisma/models/product";
import { BadRequest, Unauthorized } from "@/types/ApiResponseTypes";
import { otherPermission } from "@/types/permissionTypes";
import { canAccess } from "@/util/roleHelper";
import { Role } from "@prisma/client";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  try {
    let { id } = req.query;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);

    if (
      session &&
      (session.role === Role.Admin ||
        session.role === Role.Staff ||
        session.role === Role.SuperAdmin)
    ) {
      switch (req.method) {
        case "GET":
          let allowPermission = await canAccess(
            req,
            otherPermission.attributeView,
          );
          if (allowPermission === false) {
            return res.status(401).json(Unauthorized);
          }
          let cat = await getAllAttributes();
          return res.status(200).json(cat);
        case "POST":
          let allowPermission1 = await canAccess(
            req,
            otherPermission.attributeCreate,
          );
          if (allowPermission1 === false) {
            return res.status(401).json(Unauthorized);
          }
          let newData = JSON.parse(req.body);
          let attribute = await createAttribute(newData);
          return res.status(200).json(attribute);
        case "PUT":
          let allowPermission2 = await canAccess(
            req,
            otherPermission.attributeUpdate,
          );
          if (allowPermission2 === false) {
            return res.status(401).json(Unauthorized);
          }
          let data = JSON.parse(req.body);
          if (id) {
            let newMembership = await updateAttribute(id.toString(), data);
            return res.status(200).json(newMembership);
          } else {
            return res.status(400).json(BadRequest);
          }
        case "DELETE":
          if (id) {
            let allowPermission = await canAccess(
              req,
              otherPermission.attributeDelete,
            );
            if (allowPermission === false) {
              return res.status(401).json(Unauthorized);
            }
            let newMembership = await deleteAttribute(id.toString());
            if (newMembership.isError === true) {
              return res.status(400).json(newMembership.data);
            } else {
              return res.status(200).json(newMembership.data);
            }
          } else {
            return res.status(400).json(BadRequest);
          }
        default:
          return res.status(501).json(Unauthorized);
          break;
      }
    } else if (req.method === "GET") {
      let cat = await getAllAttributes();
      return res.status(200).json(cat);
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
}
