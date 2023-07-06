// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import {
  BadRequest,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { otherPermission } from "@/types/permissionTypes";
import { encryptPhone } from "@/util/encrypt";

import { canAccess } from "@/util/roleHelper";
import { ReviewType, Role } from "@prisma/client";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

async function getRatings(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { startDate, endDate, allow, productId, id } = req.query;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    if (id) {
      let myReview = undefined;
      if (session) {
        myReview = await prisma.review.findFirst({
          where: {
            createdByUserId: session.id,
            reviewType: ReviewType.Product,
            productId: id.toString(),
          },
          include: {
            createdBy: true,
          },
        });
      }
      let otherReviews = await prisma.review.findMany({
        where: {
          reviewType: ReviewType.Product,
          productId: id.toString(),
        },
        include: {
          createdBy: true,
        },
      });
      console.log(otherReviews);
      let order = undefined;
      if (session) {
        let orderList = await prisma.order.findMany({
          where: {
            orderByUserId: session.id,
          },
        });
        if (
          orderList.find((z) =>
            z.cartItems.find((b: any) => b.productId === id)
          )
        ) {
          order = orderList.find((z) =>
            z.cartItems.find((b: any) => b.productId === id)
          );
        }

        return res.status(200).json({
          myReview: myReview,
          otherReviews: otherReviews,
          canReview: order ? true : false,
        });
      } else {
        return res.status(200).json({
          otherReviews: otherReviews,
        });
      }
    } else if (productId) {
      const data = await prisma.review.findMany({
        where: {
          productId: productId.toString(),
        },
        include: {
          createdBy: true,
        },
      });
      return res.status(200).json(data);
    } else {
      let filter: {} = {};
      if (startDate && endDate) {
        filter = {
          ...filter,
          updatedDate: {
            $gte: startDate,
            $lte: endDate,
          },
        };
      }
      if (allow && allow.toString() === "true") {
      } else {
        let allowPermission = await canAccess(req, otherPermission.reviewView);
        if (allowPermission === false) {
          return res.status(401).json(Unauthorized);
        }
      }

      const data: any = await prisma.review.findMany({
        where: filter,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          product: {
            include: {
              seller: true,
              categories: true,
            },
          },
          createdBy: true,
        },
      });
      for (let i = 0; i < data.length; i++) {
        if (data[i].reviewType !== ReviewType.Product) {
          let user = await prisma.user.findFirst({
            where: {
              id: data[i].userId,
            },
          });
          data[i].user = user;
        }
      }

      return res.status(200).json(
        data.map((z) => {
          let img = "";
          let name = "";
          let link = "";
          if (z.reviewType === ReviewType.Product) {
            if (z.product) {
              img = z.product.imgList[0];
              name = z.product.name;
              link =
                "/products/" +
                encodeURIComponent(z.product.slug) +
                "?action=view";
            }
          } else {
            img = z.user.profile;
            name = z.user.username;
            link =
              "/account/" + encodeURIComponent(encryptPhone(z.user.phoneNum));
          }

          return { ...z, img: img, name: name, link: link };
        })
      );
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
}

async function addRatings(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { id } = req.query;
    let body: any = {};
    if (typeof req.body === "object") {
      body = req.body;
    } else {
      body = JSON.parse(req.body);
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    if (session) {
      let data = await prisma.review.findFirst({
        where: {
          productId: id.toString(),
          createdByUserId: session.id,
        },
      });

      if (data) {
        await prisma.review.update({
          where: {
            id: data.id,
          },
          data: {
            rating: parseInt(body.rating),
            message: body.message,
            reviewType: ReviewType.Product,
          },
        });
      } else {
        await prisma.review.create({
          data: {
            rating: parseInt(body.rating),
            productId: id.toString(),
            createdByUserId: session.id,
            message: body.message,
            reviewType: ReviewType.Product,
          },
        });
      }

      return res.status(200).json(Success);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
}

async function deleteRatings(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let { id } = req.query;
    let allowPermission = await canAccess(req, otherPermission.reviewDelete);
    if (allowPermission === false) {
      return res.status(401).json(Unauthorized);
    }
    if (id) {
      const data = await prisma.review.delete({
        where: {
          id: id.toString(),
        },
      });
      return res.status(200).json(Success);
    } else {
      return res.status(400).json(BadRequest);
    }
  } catch (err) {
    res.status(400).json(err);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useAuth(req);

  switch (req.method) {
    case "GET":
      return getRatings(req, res);
    case "POST":
      return addRatings(req, res);
    case "DELETE":
      if (
        session &&
        (session.role === Role.Admin ||
          session.role === Role.Staff ||
          session.role === Role.SuperAdmin)
      ) {
        return deleteRatings(req, res);
      } else {
        return res.status(401).json(Unauthorized);
      }
    default:
      return res.status(405).json(NotAvailable);
  }
}
