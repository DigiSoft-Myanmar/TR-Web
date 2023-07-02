// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import { CartItem } from "@/prisma/models/cartItems";
import prisma from "@/prisma/prisma";
import { Success, Unauthorized } from "@/types/ApiResponseTypes";
import { isInternal } from "@/util/authHelper";
import { AuctionStatus, ProductType } from "@prisma/client";
import _, { sortBy } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    if (isInternal(session) || true) {
      let auctionProds = await prisma.product.findMany({
        where: {
          type: ProductType.Auction,
          endTime: {
            lt: new Date(),
          },
        },
      });
      for (let i = 0; i < auctionProds.length; i++) {
        let auction = await prisma.auctions.findMany({
          where: {
            productId: auctionProds[i].id,
            SKU: auctionProds[i].SKU,
          },
        });
        if (auction.length > 0) {
          let lastOffer = sortBy(auction, (e) => e.amount).reverse()[0];
          if (lastOffer) {
            let wonList = await prisma.wonList.findFirst({
              where: {
                productId: auctionProds[i].id,
                auctionId: lastOffer.id,
              },
            });
            if (wonList) {
            } else {
              await prisma.wonList.create({
                data: {
                  auctionId: lastOffer.id,
                  productId: auctionProds[i].id,
                  status:
                    auctionProds[i].estimatedPrice <= lastOffer.amount
                      ? AuctionStatus.InCart
                      : AuctionStatus.LowPrice,
                },
              });

              if (auctionProds[i].estimatedPrice <= lastOffer.amount) {
                let auctionList = await prisma.auctionList.findFirst({
                  where: {
                    userId: lastOffer.createdByUserId,
                  },
                });
                let cartItem: any = {
                  normalPrice: lastOffer.amount,
                  productId: auctionProds[i].id,
                  quantity: 1,
                  sellerId: auctionProds[i].sellerId,
                  SKU: lastOffer.SKU,
                  createdAt: lastOffer.createdAt,
                  isAuction: true,
                  auctionId: lastOffer.id,
                };
                if (auctionList) {
                  if (
                    auctionList.auctionList.find(
                      (z: any) => z.auctionId === lastOffer.id
                    )
                  ) {
                  } else {
                    let list = [...auctionList.auctionList];
                    list.push(cartItem);
                    await prisma.auctionList.update({
                      where: {
                        id: auctionList.id,
                      },
                      data: {
                        auctionList: list,
                      },
                    });
                  }
                } else {
                  await prisma.auctionList.create({
                    data: {
                      auctionList: [cartItem],
                      userId: lastOffer.createdByUserId,
                    },
                  });
                }
              }
            }
          }
        }
      }
      return res.status(200).json(Success);
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
}
