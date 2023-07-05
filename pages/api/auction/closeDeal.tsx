// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import { CartItem } from "@/prisma/models/cartItems";
import prisma from "@/prisma/prisma";
import { NotAvailable, Success, Unauthorized } from "@/types/ApiResponseTypes";
import { isInternal } from "@/util/authHelper";
import {
  AuctionList,
  AuctionStatus,
  Auctions,
  Product,
  ProductType,
} from "@prisma/client";
import _, { includes, sortBy } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";

async function addAuctionList(
  lastOffer: Auctions,
  auctionProd: Product,
  auctionList: AuctionList
) {
  let cartItem: any = {
    normalPrice: lastOffer.amount,
    productId: auctionProd.id,
    quantity: 1,
    sellerId: auctionProd.sellerId,
    SKU: lastOffer.SKU,
    createdAt: lastOffer.createdAt,
    isAuction: true,
    auctionId: lastOffer.id,
  };
  if (auctionList) {
    if (
      auctionList.auctionList.find((z: any) => z.auctionId === lastOffer.id)
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

async function getAuctionList(userId: string) {
  let auctionList = await prisma.auctionList.findFirst({
    where: {
      userId: userId,
    },
  });
  if (auctionList) {
  } else {
    auctionList = await prisma.auctionList.create({
      data: {
        userId: userId,
      },
    });
  }
  return auctionList;
}

async function removeAuctionList(auctionId: string, auctionList: AuctionList) {
  if (auctionId) {
    await prisma.auctionList.update({
      where: {
        id: auctionList.id,
      },
      data: {
        auctionList: auctionList.auctionList.filter(
          (z: any) => z.auctionId !== auctionId
        ),
      },
    });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    const { id } = req.query;
    if (id && req.method === "PUT") {
      let body = JSON.parse(req.body);

      let auction = await prisma.auctions.findFirst({
        where: { id: id.toString() },
        include: {
          product: true,
        },
      });
      if (
        isInternal(session) ||
        auction.product.sellerId === session.id ||
        auction.createdByUserId === session.id
      ) {
        if (auction) {
          let wonList = await prisma.wonList.findFirst({
            where: {
              auctionId: auction.id,
            },
          });
          if (wonList) {
            await prisma.wonList.update({
              where: {
                id: wonList.id,
              },
              data: {
                status:
                  body.isAccept === true
                    ? AuctionStatus.InCart
                    : auction.product.sellerId === session.id
                    ? AuctionStatus.RejectBySeller
                    : AuctionStatus.RejectByBuyer,
              },
            });
            //TODO add notification
            let auctionList = await getAuctionList(auction.createdByUserId);
            if (body.isAccept === true) {
              await addAuctionList(auction, auction.product, auctionList);
            } else {
              await removeAuctionList(auction.id, auctionList);
            }
          } else {
            await prisma.wonList.create({
              data: {
                auctionId: auction.id,
                productId: auction.productId,
                estimatedAmount: auction.product.estimatedPrice,
                status:
                  body.isAccept === true
                    ? AuctionStatus.InCart
                    : auction.product.sellerId === session.id
                    ? AuctionStatus.RejectBySeller
                    : AuctionStatus.RejectByBuyer,
              },
            });
            let auctionList = await getAuctionList(auction.createdByUserId);
            if (body.isAccept === true) {
              await addAuctionList(auction, auction.product, auctionList);
            } else {
              await removeAuctionList(auction.id, auctionList);
            }
          }
          return res.status(200).json(Success);
        } else {
          return res.status(404).json(NotAvailable);
        }
      } else {
        return res.status(401).json(Unauthorized);
      }
    } else if (isInternal(session)) {
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
                  estimatedAmount: auctionProds[i].estimatedPrice,
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
                await addAuctionList(lastOffer, auctionProds[i], auctionList);
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
    console.log(err);
    return res.status(400).json(err);
  }
}
