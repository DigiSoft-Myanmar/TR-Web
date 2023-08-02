// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import { createTerm, deleteTerm, updateTerm } from "@/prisma/models/product";
import prisma from "@/prisma/prisma";
import {
  AlreadyExists,
  BadRequest,
  Exists,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { isBuyer, isInternal, isSeller } from "@/util/authHelper";
import { ProductType, Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let { phoneNum } = req.query;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (phoneNum) {
      switch (req.method) {
        case "GET":
          let user = await prisma.user.findFirst({
            where: {
              phoneNum: phoneNum.toString(),
            },
            include: {
              currentMembership: true,
            },
          });
          if (user) {
            let startDay = new Date(user.memberStartDate);
            let freeAdsEndDay = new Date(user.memberStartDate);
            freeAdsEndDay.setDate(
              freeAdsEndDay.getDate() + user.currentMembership.adsValidity
            );
            let endDay = new Date(user.memberStartDate);
            endDay.setDate(endDay.getDate() + user.currentMembership.validity);

            let usage = {
              freeAdsLimit: 0,
              freeAdsUsed: 0,
              adsUsed: 0,
              skuUsed: 0,
              adsListing: [],
              skuListing: [],
            };
            let ads: any = await prisma.ads.findMany({
              where: {
                adsLocations: {
                  isEmpty: false,
                },
                sellerId: user.id,
              },
              include: {
                seller: {
                  include: {
                    currentMembership: true,
                  },
                },
              },
            });

            for (let i = 0; i < ads.length; i++) {
              if (
                ads[i].adsLocations.find(
                  (z: any) =>
                    startDay.getTime() <= new Date(z.startDate).getTime() &&
                    new Date(z.startDate).getTime() <= endDay.getTime()
                )
              ) {
                let adsCount = ads[i].adsLocations.filter(
                  (z: any) =>
                    startDay.getTime() <= new Date(z.startDate).getTime() &&
                    new Date(z.startDate).getTime() <= endDay.getTime()
                ).length;

                let freeAdsCount = ads[i].adsLocations.filter(
                  (z: any) =>
                    startDay.getTime() <= new Date(z.startDate).getTime() &&
                    new Date(z.startDate).getTime() <= freeAdsEndDay.getTime()
                ).length;
                usage.freeAdsLimit = user.currentMembership.freeAdsLimit;
                usage.freeAdsUsed =
                  freeAdsCount >= user.currentMembership.freeAdsLimit
                    ? user.currentMembership.freeAdsLimit
                    : freeAdsCount;
                usage.adsUsed += adsCount;
                ads[i].adsUsed = adsCount;
                ads[i].isPlaced =
                  ads[i].adsLocations.filter((z: any) => {
                    let endDate = new Date(z.startDate);
                    endDate.setDate(
                      user.currentMembership.adsLifeTime + endDate.getDate()
                    );
                    if (endDate >= new Date()) {
                      return true;
                    } else {
                      return false;
                    }
                  }).length > 0;
                usage.adsListing.push(ads[i]);
              }
            }

            let products: any = await prisma.product.findMany({
              where: {
                sellerId: user.id,
              },
              include: {
                WonList: {
                  include: {
                    auction: true,
                  },
                },
                UnitSold: true,
              },
            });

            for (let i = 0; i < products.length; i++) {
              if (products[i].type === ProductType.Fixed) {
                usage.skuUsed += 1;
                products[i].soldUnit = products[i].UnitSold.map(
                  (z) => z.soldUnit
                ).reduce((a, b) => a + b, 0);
                products[i].skuUsaged = 1;
                usage.skuListing.push(products[i]);
              } else if (products[i].type === ProductType.Variable) {
                usage.skuUsed += products[i].variations.length;
                products[i].skuUsaged = products[i].variations.length;
                products[i].soldUnit = products[i].UnitSold.map(
                  (z) => z.soldUnit
                ).reduce((a, b) => a + b, 0);
                usage.skuListing.push(products[i]);
              } else if (products[i].type === ProductType.Auction) {
                usage.skuUsed += 1;
                products[i].soldUnit = 0;
                products[i].skuUsaged = 1;
                if (products[i].WonList.length > 0) {
                  usage.skuUsed += products[i].WonList.filter(
                    (z) => z.auction.SKU !== products[i].SKU
                  ).length;
                  products[i].skuUsaged =
                    products[i].WonList.filter(
                      (z) => z.auction.SKU !== products[i].SKU
                    ).length + 1;
                  products[i].soldUnit = products[i].WonList.filter(
                    (z) => z.status === "Purchased"
                  ).length;
                }

                usage.skuListing.push(products[i]);
              }
            }
            return res.status(200).json(usage);
          } else {
            return res.status(404).json(NotAvailable);
          }
        default:
          return res.status(501).json(NotAvailable);
      }
    } else {
      return res.status(400).json(BadRequest);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
