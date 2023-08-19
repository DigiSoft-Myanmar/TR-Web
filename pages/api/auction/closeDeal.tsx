// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import { CartItem } from "@/prisma/models/cartItems";
import prisma from "@/prisma/prisma";
import { NotAvailable, Success, Unauthorized } from "@/types/ApiResponseTypes";
import { AuctionPermission } from "@/types/permissionTypes";
import { hasPermission, isInternal } from "@/util/authHelper";
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
  Role,
} from "@prisma/client";
import _, { includes, sortBy } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { render } from "@react-email/render";
import AuctionEmail from "@/emails/auction";
import async from "async";
import { sendEmailNodeFn } from "@/util/emailNodeHelper";
import { caesarEncrypt } from "@/util/encrypt";

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
    const content = await prisma.content.findFirst({});

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    const { id, key } = req.query;
    if (id && req.method === "PUT" && session) {
      let body: any = {};
      if (typeof req.body === "object") {
        body = req.body;
      } else {
        body = JSON.parse(req.body);
      }

      let auction = await prisma.auctions.findFirst({
        where: { id: id.toString() },
        include: {
          product: {
            include: {
              seller: true,
            },
          },
        },
      });
      if (
        isInternal(session) ||
        auction.product.sellerId === session.id ||
        auction.createdByUserId === session.id
      ) {
        if (
          body.isAccept === true &&
          session &&
          session.role === Role.Staff &&
          !hasPermission(session, AuctionPermission.endedAuctionAllow)
        ) {
          return res.status(401).json(Unauthorized);
        }
        if (
          body.isAccept === false &&
          session &&
          session.role === Role.Staff &&
          !hasPermission(session, AuctionPermission.endedAuctionReject)
        ) {
          return res.status(401).json(Unauthorized);
        }
        if (auction) {
          let wonList = await prisma.wonList.findFirst({
            where: {
              auctionId: auction.id,
            },
            include: {
              auction: true,
            },
          });
          if (wonList) {
            let wonAuction = await prisma.wonList.update({
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
            let userId = caesarEncrypt(wonAuction.auction.createdByUserId, 5);
            let status =
              body.isAccept === true
                ? "won by " + userId + " and it is currently in cart with "
                : auction.product.sellerId === session.id
                ? "was rejected by seller with "
                : "was rejected by buyer with ";

            let statusTitle =
              body.isAccept === true
                ? "Won Auction"
                : auction.product.sellerId === session.id
                ? "Auction Rejected by Seller"
                : "Auction Rejected by Buyer";

            let statusIcon =
              body.isAccept === true
                ? NotiType.AuctionWon
                : auction.product.sellerId === session.id
                ? NotiType.AuctionRejectedBySeller
                : NotiType.AuctionRejectedByBuyer;

            let adminList = await getAdminIdList();
            let staffList = await getStaffIdList(
              AuctionPermission.allBidAuctionNoti
            );

            let msg: any = {
              body:
                auction.product.name +
                " " +
                status +
                formatAmount(wonList.auction.amount, "en", true),
              createdAt: new Date().toISOString(),
              title: statusTitle + " : " + auction.product.name,
              type: statusIcon,
              requireInteraction: false,
              sendList: [
                ...adminList,
                ...staffList,
                wonList.auction.createdByUserId,
                auction.product.sellerId,
              ],
              details: {
                web: "/auctions",
                mobile: {
                  screen: "Auctions",
                },
                buyer: wonList.auction.createdByUserId,
                seller: auction.product.sellerId,
              },
            };
            await addNotification(msg, "");

            let adminEmail = await getAdminEmailList();
            let staffEmail = await getStaffEmailList(
              AuctionPermission.allBidAuctionEmail
            );
            let emailSendList = [...adminEmail, ...staffEmail];
            if (wonAuction.auction.createdBy.email) {
              emailSendList.push(wonAuction.auction.createdBy.email);
            }
            if (wonAuction.product.seller.email) {
              emailSendList.push(wonAuction.product.seller.email);
            }

            const emailHtml = render(
              <AuctionEmail content={content!} wonList={wonAuction} />
            );

            async.each(
              emailSendList,
              function (email: any, callback) {
                sendEmailNodeFn(
                  statusTitle + " : " + wonAuction.product.name,
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
    } else if (
      isInternal(session) ||
      (key && key.toString() === "rmRNMOIQ9P")
    ) {
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
          include: {
            product: {
              include: {
                seller: true,
              },
            },
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
        let autoCancelAuction = await prisma.wonList.update({
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

        let sellerName = autoCancelAuction.product.seller.username;

        let msg: any = {
          body:
            autoCancelAuction.product.name +
            " was auto cancelled since no action taken by seller: " +
            sellerName +
            ".",
          createdAt: new Date().toISOString(),
          title: "Auto cancelled" + " : " + autoCancelAuction.product.name,
          type: NotiType.AuctionAutoCancelled,
          requireInteraction: false,
          sendList: [
            ...adminList,
            ...staffList,
            autoCancelAuction.auction.createdByUserId,
            autoCancelAuction.product.sellerId,
          ],
          details: {
            web: "/auctions",
            mobile: {
              screen: "Auctions",
            },
            buyer: autoCancelAuction.auction.createdByUserId,
            seller: autoCancelAuction.product.sellerId,
          },
        };
        await addNotification(msg, "");

        let adminEmail = await getAdminEmailList();
        let staffEmail = await getStaffEmailList(
          AuctionPermission.allBidAuctionEmail
        );

        let emailSendList = [...adminEmail, ...staffEmail];
        if (autoCancelAuction.auction.createdBy.email) {
          emailSendList.push(autoCancelAuction.auction.createdBy.email);
        }
        if (autoCancelAuction.product.seller.email) {
          emailSendList.push(autoCancelAuction.product.seller.email);
        }

        const emailHtml = render(
          <AuctionEmail content={content!} wonList={autoCancelAuction} />
        );

        async.each(
          emailSendList,
          function (email: any, callback) {
            sendEmailNodeFn(
              "Auto cancelled" + " : " + autoCancelAuction.product.name,
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
