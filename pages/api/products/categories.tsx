// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getOriginalCategories,
  updateCategory,
} from "@/prisma/models/product";
import { BadRequest, BadSlug, Unauthorized } from "@/types/ApiResponseTypes";
import { otherPermission } from "@/types/permissionTypes";
import { canAccess } from "@/util/roleHelper";
import { Role } from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";

async function addCategory(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let data = JSON.parse(req.body);
    let newMembership = await createCategory(data);
    res.status(200).json(newMembership);
  } catch (err: any) {
    return res.status(400).json(err);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let { id } = req.query;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);

    switch (req.method) {
      case "GET":
        let allowPermission = await canAccess(
          req,
          otherPermission.categoriesView
        );
        if (allowPermission === false) {
          return res.status(401).json(Unauthorized);
        }
        let { isOriginal } = req.query;
        if (isOriginal === "true") {
          let cat = await getOriginalCategories();
          return res.status(200).json(cat);
        } else {
          let cat = await getAllCategories();
          return res.status(200).json(cat);
        }
      case "POST":
        if (
          session &&
          (session.role === Role.Admin ||
            session.role === Role.Staff ||
            session.role === Role.SuperAdmin)
        ) {
          let allowPermission = await canAccess(
            req,
            otherPermission.categoriesCreate
          );
          if (allowPermission === false) {
            return res.status(401).json(Unauthorized);
          }
          return addCategory(req, res);
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
          let allowPermission = await canAccess(
            req,
            otherPermission.categoriesUpdate
          );
          if (allowPermission === false) {
            return res.status(401).json(Unauthorized);
          }
          let data = JSON.parse(req.body);
          if (id) {
            if (data.id) {
              delete data.id;
            }
            let newMembership = await updateCategory(id.toString(), data);
            return res.status(200).json(newMembership);
          } else {
            return res.status(400).json(BadRequest);
          }
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
          let allowPermission = await canAccess(
            req,
            otherPermission.categoriesDelete
          );
          if (allowPermission === false) {
            return res.status(401).json(Unauthorized);
          }
          if (id) {
            let newMembership = await deleteCategory(id.toString());
            if (newMembership.isError === true) {
              return res.status(400).json(newMembership.data);
            } else {
              return res.status(200).json(newMembership.data);
            }
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
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
