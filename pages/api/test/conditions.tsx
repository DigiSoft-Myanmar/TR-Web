import prisma from "@/prisma/prisma";
import { Role } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let data = require("./conditions.json");
    let prodCount = 0;

    for (let i = 0; i < data.length; i++) {
      await prisma.condition.create({
        data: {
          name: data[i].name,
          nameMM: data[i].nameMM,
        },
      });
    }
    return res.status(200).json({ prodCount: data.length });
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
