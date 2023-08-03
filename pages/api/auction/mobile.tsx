import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import {
  BadAuctionClose,
  BadAuctionLessAmount,
  BadAuctionSeller,
  BadRequest,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { AuctionPermission, otherPermission } from "@/types/permissionTypes";
import { isBuyer } from "@/util/authHelper";
import { sendEmailNodeFn } from "@/util/emailNodeHelper";
import { caesarEncrypt } from "@/util/encrypt";
import { getDevice } from "@/util/getDevice";
import {
  addNotification,
  getAdminEmailList,
  getAdminIdList,
  getStaffEmailList,
  getStaffIdList,
} from "@/util/notiHelper";
import { formatAmount } from "@/util/textHelper";
import { isTodayBetween } from "@/util/verify";
import { NotiType } from "@prisma/client";
import e from "express";
import { NextApiRequest, NextApiResponse } from "next";
import { render } from "@react-email/render";
import async from "async";
import BidEmail from "@/emails/bid";

async function getAuctionList(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { lastTime, productId } = req.query;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session: any = await useAuth(req);
    if (productId) {
      if (lastTime) {
        const auctionInfo = await prisma.auctions.findMany({
          where: {
            createdAt: {
              gte: new Date(lastTime.toString()).toISOString(),
            },
            productId: productId.toString(),
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        return res.status(200).json({ newAuctions: auctionInfo });
      } else {
        return res.status(404).json(NotAvailable);
      }
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
}

async function addBid(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const content = await prisma.content.findFirst({});
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session: any = await useAuth(req);
    if (session && isBuyer(session)) {
      let body: any = {};
      if (typeof req.body === "object") {
        body = req.body;
      } else {
        body = JSON.parse(req.body);
      }

      let product = await prisma.product.findFirst({
        where: {
          id: body.productId,
        },
      });

      if (product) {
        if (
          new Date(product.startTime).getTime() <= new Date().getTime() &&
          new Date(product.endTime).getTime() >= new Date().getTime()
        ) {
          let auction = await prisma.auctions.findFirst({
            where: {
              productId: product.id,
              SKU: product.SKU,
            },
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
          });
          if (auction) {
            if (auction.amount > body.amount) {
              return res.status(400).json(BadAuctionLessAmount);
            }
          }
          if (product.sellerId === session.id) {
            return res.status(400).json(BadAuctionSeller);
          }

          let newAuction = await prisma.auctions.create({
            data: {
              amount: body.amount,
              SKU: body.SKU,
              createdByUserId: session.id,
              productId: body.productId,
            },
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
          });

          let adminList = await getAdminIdList();
          let staffList = await getStaffIdList(
            AuctionPermission.allBidAuctionNoti
          );
          let bidList = await prisma.auctions.findMany({
            where: {
              productId: body.productId,
              SKU: body.SKU,
            },
            include: {
              createdBy: true,
            },
          });
          let buyerList = Array.from(
            new Set(bidList.map((z) => z.createdByUserId))
          );
          let userId = caesarEncrypt(session.id, 5);

          let msg: any = {
            body:
              userId +
              " bid " +
              formatAmount(body.amount, "en", true) +
              " for " +
              product.name,
            createdAt: new Date().toISOString(),
            title: "New Bid for Product: " + product.name,
            type: NotiType.NewBid,
            requireInteraction: false,
            sendList: [
              ...adminList,
              ...staffList,
              ...buyerList,
              product.sellerId,
            ],
            details: {
              web: "/marketplace/" + encodeURIComponent(product.slug),
              mobile: {
                screen: "Products",
                slug: product.slug,
              },
            },
          };
          await addNotification(msg, "");

          await prisma.product.update({
            where: {
              id: body.productId,
            },
            data: {
              priceIndex: body.amount,
            },
          });

          let adminEmail = await getAdminEmailList();
          let staffEmail = await getStaffEmailList(
            AuctionPermission.allBidAuctionEmail
          );

          let emailSendList = [...adminEmail, ...staffEmail];
          if (newAuction.product.sellerId) {
            let seller = await prisma.user.findFirst({
              where: {
                id: newAuction.product.sellerId,
              },
            });
            if (seller?.email) {
              emailSendList.push(seller.email);
            }
          }
          let buyerEmail = Array.from(
            new Set(
              bidList.map((z) => (z.createdBy.email ? z.createdBy.email : ""))
            )
          ).filter((z) => z);
          emailSendList = [...emailSendList, ...buyerEmail];

          async.each(
            emailSendList,
            function (email: any, callback) {
              const emailHtml = render(
                <BidEmail
                  content={content!}
                  auction={newAuction}
                  buyerId={newAuction.createdByUserId}
                  toBuyer={buyerEmail.find((z) => z === email) ? true : false}
                />
              );
              sendEmailNodeFn(
                "New Bid for Product: " + product.name,
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

          return res.status(200).json(Success);
        } else {
          return res.status(400).json(BadAuctionClose);
        }
      } else {
        return res.status(400).json(BadRequest);
      }
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    console.log(err);

    return res.status(400).json(err);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useAuth(req);
  if (session) {
    switch (req.method) {
      case "GET": {
        return getAuctionList(req, res);
      }
      case "POST": {
        return addBid(req, res);
      }
      default:
        return res.status(405).json(NotAvailable);
    }
  } else {
    return res.status(401).json(Unauthorized);
  }
}
