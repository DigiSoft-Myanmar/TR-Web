// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import { BadRequest, NotAvailable } from "@/types/ApiResponseTypes";
import type { NextApiRequest, NextApiResponse } from "next";
import { render } from "@react-email/render";
import AuctionEmail from "@/emails/auction";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let { id } = req.query;
    if (id) {
      const content = await prisma.content.findFirst({});

      let wonList = await prisma.wonList.findFirst({
        include: {
          auction: {
            include: {
              createdBy: true,
            },
          },
          product: {
            include: {
              Brand: true,
              Condition: true,
              seller: true,
            },
          },
        },
        where: {
          id: id.toString(),
        },
      });

      if (wonList) {
        const emailHtml = render(
          <AuctionEmail content={content!} wonList={wonList} />
        );

        return res.send(emailHtml);
      } else {
        return res.status(404).json(NotAvailable);
      }
    } else {
      return res.status(400).json(BadRequest);
    }
  } catch (err) {
    console.log(err);
  }
}
