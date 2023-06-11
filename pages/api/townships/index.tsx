// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import { getAllTownships } from "@/prisma/models/townships";
import prisma from "@/prisma/prisma";
import {
  BadRequest,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { Role } from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";

async function getTownships(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { isAll } = req.query;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);

    let data: any = await getAllTownships();

    if (
      session &&
      (session.role === Role.Admin ||
        session.role === Role.Staff ||
        session.role === Role.SuperAdmin)
    ) {
      if (isAll === "true") {
        for (let i = 0; i < data.length; i++) {
          data[i].sellerCount = await prisma.user.count({
            where: {
              role: {
                in: [Role.Seller, Role.Trader],
              },
              stateId: data[i].id,
            },
          });
          data[i].buyerCount = await prisma.user.count({
            where: {
              role: {
                in: [Role.Buyer, Role.Trader],
              },
              stateId: data[i].id,
            },
          });
          if (data[i].districts) {
            for (let j = 0; j < data[i].districts.length; j++) {
              data[i].districts[j].sellerCount = await prisma.user.count({
                where: {
                  role: {
                    in: [Role.Seller, Role.Trader],
                  },
                  districtId: data[i].districts[j].id,
                },
              });
              data[i].districts[j].buyerCount = await prisma.user.count({
                where: {
                  role: {
                    in: [Role.Buyer, Role.Trader],
                  },
                  districtId: data[i].districts[j].id,
                },
              });
              if (data[i].districts[j].townships) {
                for (
                  let k = 0;
                  k < data[i].districts[j].townships.length;
                  k++
                ) {
                  data[i].districts[j].townships[k].brandCount =
                    await prisma.user.count({
                      where: {
                        role: {
                          in: [Role.Seller, Role.Trader],
                        },
                        townshipId: data[i].districts[j].townships[k].id,
                      },
                    });
                  data[i].districts[j].townships[k].buyerCount =
                    await prisma.user.count({
                      where: {
                        role: {
                          in: [Role.Buyer, Role.Trader],
                        },
                        townshipId: data[i].districts[j].townships[k].id,
                      },
                    });
                }
              }
            }
          }
        }
      }
    }
    return res.status(200).json(data);
  } catch (err) {
    res.status(400).json(err);
  }
}

async function updateTownships(req: NextApiRequest, res: NextApiResponse<any>) {
  let { stateId } = req.query;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useAuth(req);
  const body: any = JSON.parse(req.body);
  try {
    if (
      session &&
      (session.role === Role.Admin ||
        session.role === Role.SuperAdmin ||
        session.role === Role.Staff)
    ) {
      if (stateId) {
        await prisma.state.update({
          where: {
            id: stateId.toString(),
          },
          data: {
            color: body.color,
          },
        });
        return res.status(200).json(Success);
      } else {
        return res.status(400).json(BadRequest);
      }
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useAuth(req);

  switch (req.method) {
    case "GET":
      return getTownships(req, res);
    case "PUT":
      return updateTownships(req, res);
    default:
      return res.status(405).json(NotAvailable);
  }
}
