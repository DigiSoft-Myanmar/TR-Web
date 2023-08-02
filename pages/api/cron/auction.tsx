// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import { CartItem } from "@/prisma/models/cartItems";
import prisma from "@/prisma/prisma";
import { NotAvailable, Success, Unauthorized } from "@/types/ApiResponseTypes";
import { AuctionPermission } from "@/types/permissionTypes";
import { isInternal } from "@/util/authHelper";
import { sendEmailNodeFn } from "@/util/emailNodeHelper";
import {
  addNotification,
  getAdminEmailList,
  getAdminIdList,
  getStaffEmailList,
  getStaffIdList,
} from "@/util/notiHelper";
import { formatAmount } from "@/util/textHelper";
import {
  AuctionList,
  AuctionStatus,
  Auctions,
  NotiType,
  Product,
  ProductType,
} from "@prisma/client";
import _, { includes, sortBy } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { render } from "@react-email/render";
import AuctionEmail from "@/emails/auction";
import async from "async";

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let content = await prisma.content.findFirst({});
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { key } = req.query;
    if (key && key.toString() === "rmRNMOIQ9P") {
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
      let d = new Date();
      d.setDate(d.getDate() - 2);
      let wonList = await prisma.wonList.findMany({
        where: {
          status: "LowPrice",
          createdAt: {
            lte: d,
          },
        },
      });
      for (let i = 0; i < wonList.length; i++) {
        let auction = await prisma.wonList.update({
          where: {
            id: wonList[i].id,
          },
          data: {
            status: "AutoCancelled",
          },
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
        });

        let adminList = await getAdminIdList();
        let staffList = await getStaffIdList(
          AuctionPermission.allBidAuctionNoti
        );

        let msg: any = {
          body:
            auction.product.name +
            " was auto cancelled due to inactivity of seller.",
          createdAt: new Date().toISOString(),
          title: "Auto cancelled" + " : " + auction.product.name,
          type: NotiType.AuctionAutoCancelled,
          requireInteraction: false,
          sendList: [
            ...adminList,
            ...staffList,
            auction.auction.createdByUserId,
            auction.product.sellerId,
          ],
          details: {
            web: "/auctions",
            mobile: {
              screen: "Auctions",
            },
            buyer: auction.auction.createdByUserId,
            seller: auction.product.sellerId,
          },
        };
        await addNotification(msg, "");

        let adminEmail = await getAdminEmailList();
        let staffEmail = await getStaffEmailList(
          AuctionPermission.allBidAuctionEmail
        );

        let emailSendList = [...adminEmail, ...staffEmail];
        if (auction.auction.createdBy.email) {
          emailSendList.push(auction.auction.createdBy.email);
        }
        if (auction.product.seller.email) {
          emailSendList.push(auction.product.seller.email);
        }

        const emailHtml = render(
          <AuctionEmail content={content!} wonList={auction} />
        );

        async.each(
          emailSendList,
          function (email: any, callback) {
            sendEmailNodeFn(
              "Auto cancelled" + " : " + auction.product.name,
              emailHtml,
              [email]
            );
          },
          function (error) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email Sent Successfully.");
            }
          }
        );
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
