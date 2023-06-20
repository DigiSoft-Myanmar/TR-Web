import prisma from "@/prisma/prisma";
import { Success } from "@/types/ApiResponseTypes";
import { Colors } from "@/types/color";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let data = require("./categories.json");
    let d = new Date();
    d.setDate(d.getDate() - 1);
    let catData = await prisma.category.findMany({
      where: {
        createdAt: {
          gte: d,
        },
      },
    });
    return res.status(200).json(catData);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
