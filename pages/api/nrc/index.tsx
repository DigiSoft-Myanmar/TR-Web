// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import _ from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let data = require("./nrc.json");
    let states = _.chain(data.data)
      .groupBy((d) => d.nrc_code)
      .map((d, nrc) => {
        return {
          states: nrc,
          data: d,
        };
      })
      .value();

    for (let i = 0; i < states.length; i++) {
      for (let j = 0; j < states[i].data.length; j++) {
        let z = states[i].data[j];
        let r = {
          name_mm: z.name_mm.substring(1, z.name_mm.indexOf(")")),
          name: z.name_en,
        };
        states[i].data[j] = r;
      }
    }

    res.status(200).json(states);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
}
