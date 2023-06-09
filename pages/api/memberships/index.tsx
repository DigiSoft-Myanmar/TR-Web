// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import {
  createMembership,
  deleteMembership,
  getAllMemberships,
  getMembershipById,
  getMembershipByName,
  updateMembership,
} from "@/prisma/models/membership";
import { BadRequest, Success, Unauthorized } from "@/types/ApiResponseTypes";
import { Membership, Role } from "@prisma/client";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

async function modifyMembership(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  try {
    let data = JSON.parse(req.body);
    let mem = await getMembershipByName(data.name);
    if (mem) {
      let newMembership = await updateMembership(mem.id, data);
      res.status(200).json(newMembership);
    } else {
      let newMembership = await createMembership(data);
      res.status(200).json(newMembership);
    }
  } catch (err: any) {
    return res.status(400).json(err);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  try {
    if (req.method === "GET") {
      const { id: getId } = req.query;
      if (getId) {
        let mem = await getMembershipById(getId.toString());
        return res.status(200).json(mem);
      } else {
        let mem = await getAllMemberships();
        return res.status(200).json(mem);
      }
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    if (
      session &&
      (session.role === Role.Admin ||
        session.role === Role.SuperAdmin ||
        session.role === Role.Staff)
    ) {
      switch (req.method) {
        case "POST":
          return modifyMembership(req, res);
        case "PUT":
          let data = JSON.parse(req.body);
          let { id } = req.query;
          if (id) {
            let newMembership = await updateMembership(id.toString(), data);
            return res.status(200).json(newMembership);
          } else {
            return res.status(400).json(BadRequest);
          }
        case "DELETE":
          let { id: deleteId } = req.query;
          if (deleteId) {
            await deleteMembership(deleteId.toString());
            return res.status(200).json(Success);
          } else {
            return res.status(400).json(BadRequest);
          }
        default:
          res.status(501).json(Unauthorized);
          break;
      }
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    console.log(err);
  }
}
