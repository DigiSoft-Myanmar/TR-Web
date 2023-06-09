// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import { createTerm, deleteTerm, updateTerm } from "@/prisma/models/product";
import { BadRequest, Unauthorized } from "@/types/ApiResponseTypes";
import { Role } from "@prisma/client";
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
        case "POST":
          let newData = JSON.parse(req.body);
          let term = await createTerm(newData);
          return res.status(200).json(term);
        case "PUT":
          let data = JSON.parse(req.body);
          if (id) {
            let newTerm = await updateTerm(id.toString(), data);
            return res.status(200).json(newTerm);
          } else {
            return res.status(400).json(BadRequest);
          }
        case "DELETE":
          if (id) {
            let newMembership = await deleteTerm(id.toString());
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
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
