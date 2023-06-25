// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import {
  AlreadyExists,
  BadRequest,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { AdsLocation, AdsPage } from "@/util/adsHelper";
import { Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    if (req.method === "GET") {
      let { placement } = req.query;
      if (placement) {
        let ads = await prisma.ads.findMany({});

        switch (placement.toString()) {
          case AdsPage.Marketplace:
            ads = ads.filter(
              (z) =>
                z.adsLocations.filter(
                  (b: any) =>
                    b.location === AdsLocation.Marketplace1 ||
                    b.location === AdsLocation.Marketplace21 ||
                    b.location === AdsLocation.Marketplace22 ||
                    b.location === AdsLocation.Marketplace23 ||
                    b.location === AdsLocation.Marketplace24
                ).length > 0
            );
            break;
          case AdsPage.Membership:
            ads = ads.filter(
              (z) =>
                z.adsLocations.filter(
                  (b: any) => b.location === AdsLocation.Memberships1
                ).length > 0
            );
            break;
          case AdsPage.Product:
            ads = ads.filter(
              (z) =>
                z.adsLocations.filter(
                  (b: any) =>
                    b.location === AdsLocation.ProductAds11 ||
                    b.location === AdsLocation.ProductAds12 ||
                    b.location === AdsLocation.ProductAds21 ||
                    b.location === AdsLocation.ProductAds22 ||
                    b.location === AdsLocation.ProductAds23 ||
                    b.location === AdsLocation.ProductAds24
                ).length > 0
            );
            break;
          default:
            ads = ads.filter(
              (z) =>
                z.adsLocations.filter(
                  (b: any) =>
                    b.location === AdsLocation.HomeAds1 ||
                    b.location === AdsLocation.HomeAds21 ||
                    b.location === AdsLocation.HomeAds22 ||
                    b.location === AdsLocation.HomeAds31 ||
                    b.location === AdsLocation.HomeAds32 ||
                    b.location === AdsLocation.HomeAds33 ||
                    b.location === AdsLocation.HomeAds34 ||
                    b.location === AdsLocation.HomeAds41 ||
                    b.location === AdsLocation.HomeAds42 ||
                    b.location === AdsLocation.HomeAds43 ||
                    b.location === AdsLocation.HomeAds44
                ).length > 0
            );
            break;
        }
        return res.status(200).json(ads);
      } else {
        let ads = await prisma.ads.findMany({
          include: {
            seller: {
              include: {
                currentMembership: true,
              },
            },
          },
        });
        return res.status(200).json(ads);
      }
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    if (
      session &&
      (session.role === Role.Admin ||
        session.role === Role.SuperAdmin ||
        session.role === Role.Staff)
    ) {
      let { id } = req.query;
      switch (req.method) {
        case "POST":
          let body = JSON.parse(req.body);
          await prisma.ads.create({
            data: body,
          });
          return res.status(200).json(Success);
        case "PUT":
          if (id) {
            let body = JSON.parse(req.body);
            await prisma.ads.update({
              where: {
                id: id.toString(),
              },
              data: body,
            });
            return res.status(200).json(Success);
          } else {
            return res.status(400).json(BadRequest);
          }
        case "DELETE":
          if (id) {
            await prisma.ads.delete({
              where: {
                id: id.toString(),
              },
            });
            return res.status(200).json(Success);
          } else {
            return res.status(400).json(BadRequest);
          }
        default:
          return res.status(501).json(NotAvailable);
      }
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
