// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import { Unauthorized } from "@/types/ApiResponseTypes";
import { OrderStatus } from "@/types/orderTypes";
import { isSeller } from "@/util/authHelper";
import { isCartValid } from "@/util/orderHelper";
import { Order, Role } from "@prisma/client";
import { sortBy } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";

export async function addCartItems(order: any) {
  for (let i = 0; i < order.cartItems.length; i++) {
    let prod = await prisma.product.findFirst({
      where: {
        id: order.cartItems[i].productId,
      },
      include: {
        Brand: true,
        Condition: true,
        seller: true,
      },
    });
    order.cartItems[i].prodDetail = prod;
  }
  return order;
}

export async function addOrderDetails(order: any, sellerId?: string) {
  for (let i = 0; i < order.length; i++) {
    let statusArr = [];
    for (let j = 0; j < order[i].sellerResponse.length; j++) {
      let status: any = order[i].sellerResponse[j];
      let s = sortBy(
        status.statusHistory,
        (obj: any) => obj.updatedDate
      ).reverse()[0];
      let brand = await prisma.user.findFirst({
        where: {
          id: status.sellerId,
        },
      });
      statusArr.push({
        seller: brand,
        status: s.status,
        updatedDate: s.updatedDate,
      });
    }
    order[i].invoiceStatus = statusArr;
    order[i].actions = order[i].orderNo;

    if (order[i].cartItems) {
      if (sellerId) {
        order[i].total = order[i].cartItems
          .filter(
            (e: any) =>
              isCartValid(
                order[i].sellerResponse.find(
                  (e: any) => e.sellerId === sellerId
                )
              ) && e.sellerId === sellerId
          )
          .map((e: any) =>
            e.salePrice ? e.salePrice * e.quantity : e.normalPrice * e.quantity
          )
          .reduce((a: number, b: number) => a + b, 0);
      } else {
        order[i].total = order[i].cartItems
          .filter((c: any) =>
            isCartValid(
              order[i].sellerResponse.find(
                (e: any) => e.sellerId === c.sellerId
              )
            )
          )
          .map((e: any) =>
            e.salePrice ? e.salePrice * e.quantity : e.normalPrice * e.quantity
          )
          .reduce((a: number, b: number) => a + b, 0);
      }
    }
  }
  return order;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    const { isBuyer } = req.query;
    if (session) {
      if (session.role === Role.Buyer || isBuyer === "true") {
        const order = await prisma.order.findMany({
          orderBy: { createdAt: "desc" },
          where: {
            orderByUserId: session.id,
          },
          include: {
            orderBy: true,
            promoCodes: true,
          },
        });

        let returnOrder: any = await addOrderDetails(order);
        return res.status(200).json(returnOrder);
      } else if (isSeller(session)) {
        const order = await prisma.order.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            orderBy: true,
          },
        });
        const sellerOrders = order.filter(
          (e) =>
            e.cartItems.find((z: any) => z.sellerId === session.id) &&
            e.sellerResponse.find(
              (z: any) =>
                z.sellerId === session.id &&
                z.statusHistory.find(
                  (b: any) => b.status === OrderStatus.OrderReceived
                )
            )
        );
        let returnOrder: any = await addOrderDetails(sellerOrders, session.id);
        return res.status(200).json(returnOrder);
      } else {
        const order = await prisma.order.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            orderBy: true,
          },
        });
        let returnOrder: any = await addOrderDetails(order);
        return res.status(200).json(returnOrder);
      }
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
