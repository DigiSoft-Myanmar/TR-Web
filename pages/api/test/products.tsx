import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let data = require("./products.json");

    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
