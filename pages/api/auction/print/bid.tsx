// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import { BadRequest, NotAvailable } from "@/types/ApiResponseTypes";
import type { NextApiRequest, NextApiResponse } from "next";
import { render } from "@react-email/render";
import AuctionEmail from "@/emails/auction";
import BidEmail from "@/emails/bid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let { id } = req.query;
    if (id) {
      const content = await prisma.content.findFirst({});

      let auction = await prisma.auctions.findFirst({
        include: {
          product: {
            include: {
              Brand: true,
              Condition: true,
              seller: true,
            },
          },
          createdBy: true,
        },
        where: {
          id: id.toString(),
        },
      });

      if (auction) {
        const emailHtml = render(
          <BidEmail
            content={content!}
            auction={auction}
            toBuyer={true}
            buyerId={auction.createdByUserId}
          />
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
