import prisma from "@/prisma/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let data = require("./attributes.json");
    for (let i = 0; i < data.length; i++) {
      let attribute = await prisma.attribute.create({
        data: {
          name: data[i].name,
          nameMM: data[i].nameMM,
          type: data[i].type,
        },
      });

      if (data[i].terms) {
        for (let j = 0; j < data[i].terms.length; j++) {
          await prisma.term.create({
            data: {
              name: data[i].terms[j].name,
              nameMM: data[i].terms[j].nameMM,
              value: data[i].terms[j].value,
              attributeId: attribute.id,
            },
          });
        }
      }
    }
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
