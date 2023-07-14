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
import { ReportPermission } from "@/types/permissionTypes";
import { isInternal } from "@/util/authHelper";
import { canAccess } from "@/util/roleHelper";
import { Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { addOrderDetails } from "../orders";
import {
  getSubTotal,
  getSubTotalCompleted,
  isCartValid,
  isCompleted,
} from "@/util/orderHelper";
import { CartItem } from "@/prisma/models/cartItems";
import { monthDiff } from "@/util/reportHelper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let { id } = req.query;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session: any = await useAuth(req);
    let authorize = await canAccess(req, ReportPermission.reportBuyerViewAllow);
    if (isInternal(session) && authorize) {
      switch (req.method) {
        case "GET":
          let { startDate, endDate, sellerId, brandId } = req.query;

          let today = new Date();

          let endDate1 = new Date(today);
          endDate1.setMonth(today.getMonth() + 1);
          endDate1.setDate(0);
          endDate1.setHours(23, 59, 59, 999);

          let startDate1 = new Date(today);
          startDate1.setMonth(startDate1.getMonth() - 2);
          startDate1.setHours(0, 0, 0, 0);
          startDate1.setDate(1);

          if (startDate) {
            startDate1 = new Date(startDate.toString());
          }
          if (endDate) {
            endDate1 = new Date(endDate.toString());
          }

          let seller = undefined;

          if (sellerId) {
            seller = await prisma.user.findFirst({
              where: {
                id: sellerId.toString(),
                role: {
                  in: [Role.Seller, Role.Trader],
                },
              },
            });
          }

          let brand = await prisma.brand.findFirst({});
          if (brandId) {
            brand = await prisma.brand.findFirst({
              where: {
                id: brandId.toString(),
              },
            });
          }

          let orgOrders = await prisma.order.findMany({
            where: {
              createdAt: {
                gte: startDate1,
                lte: endDate1,
              },
            },
            include: {
              orderBy: true,
            },
          });

          let orders = [];

          for (let i = 0; i < orgOrders.length; i++) {
            let cartItems = [];
            for (let j = 0; j < orgOrders[i].cartItems.length; j++) {
              let cart: any = orgOrders[i].cartItems[j];
              let prod = await prisma.product.findFirst({
                where: {
                  id: cart.productId,
                  brandId: brand.id,
                },
              });
              if (
                prod &&
                isCompleted(orgOrders[i].sellerResponse, prod.sellerId)
              ) {
                if (seller) {
                  if (seller.id === prod.sellerId) {
                    cartItems.push(orgOrders[i].cartItems[j]);
                  }
                } else {
                  cartItems.push(orgOrders[i].cartItems[j]);
                }
              }
            }
            if (cartItems.length > 0) {
              orders.push({
                ...orgOrders[i],
                cartItems: cartItems,
              });
            }
          }

          let stateList = (await prisma.state.findMany({})).map((s) => {
            return {
              ...s,
              orderCount: orders.filter((z: any) =>
                z.isAddressDiff === true
                  ? z.shippingAddress.stateId === s.id
                  : z.billingAddress.stateId === s.id
              ).length,
              unitSold: orders
                .filter((z: any) =>
                  z.isAddressDiff === true
                    ? z.shippingAddress.stateId === s.id
                    : z.billingAddress.stateId === s.id
                )
                .map((z: any) =>
                  z.cartItems
                    .map((z: any) => z.quantity)
                    .reduce((a, b) => a + b, 0)
                )
                .reduce((a, b) => a + b, 0),
              profits: orders
                .filter((z: any) =>
                  z.isAddressDiff === true
                    ? z.shippingAddress.stateId === s.id
                    : z.billingAddress.stateId === s.id
                )
                .map((z: any) =>
                  z.cartItems
                    .map((z) =>
                      z.salePrice
                        ? z.salePrice * z.quantity
                        : z.normalPrice * z.quantity
                    )
                    .reduce((a, b) => a + b, 0)
                )
                .reduce((a, b) => a + b, 0),
            };
          });

          let returnOrder: any = await addOrderDetails(orders);
          let totalAmount = orders
            .map((z) => getSubTotalCompleted(z, seller?.id))
            .reduce((a, b) => a + b, 0);
          let totalOrders = orders.length;
          let totalUnitSold = orders
            .map((z) =>
              z.cartItems
                .filter((b: any) => (seller ? b.sellerId === seller.id : true))
                .map((z: any) => z.quantity)
                .reduce((a, b) => a + b, 0)
            )
            .reduce((a, b) => a + b, 0);
          let totalUniqueBuyers = Array.from(
            new Set(orders.map((z) => z.orderByUserId))
          ).length;
          let totalAuctions = orders
            .map((z) =>
              z.cartItems
                .filter(
                  (b: any) =>
                    (seller ? b.sellerId === seller.id : true) &&
                    b.isAuction === true
                )
                .map((z: any) => z.quantity)
                .reduce((a, b) => a + b, 0)
            )
            .reduce((a, b) => a + b, 0);

          let month = monthDiff(startDate1, endDate1) + 1;
          let monthStats = [];
          for (let i = 0; i < month; i++) {
            let date = new Date(startDate1);
            date.setMonth(startDate1.getMonth() + i);
            date.setDate(1);

            let eDate = new Date(date);
            eDate.setMonth(date.getMonth() + 1);
            eDate.setHours(23, 59, 59, 999);
            eDate.setDate(0);

            monthStats.push({
              startDate: date,
              endDate: eDate,
              title: date.toLocaleDateString("en-ca", {
                year: "numeric",
                month: "short",
              }),
              orderCount: orders.filter(
                (z) =>
                  new Date(z.createdAt).getTime() >= date.getTime() &&
                  new Date(z.createdAt).getTime() <= eDate.getTime()
              ).length,
              unitSolds: orders
                .filter(
                  (z) =>
                    new Date(z.createdAt).getTime() >= date.getTime() &&
                    new Date(z.createdAt).getTime() <= eDate.getTime()
                )
                .map((z) =>
                  z.cartItems
                    .map((b: any) => b.quantity)
                    .reduce((a, b) => a + b, 0)
                )
                .reduce((a, b) => a + b, 0),
              profits: orders
                .filter(
                  (z) =>
                    new Date(z.createdAt).getTime() >= date.getTime() &&
                    new Date(z.createdAt).getTime() <= eDate.getTime()
                )
                .map((z) =>
                  z.cartItems
                    .map((b: any) =>
                      b.salePrice
                        ? b.salePrice * b.quantity
                        : b.normalPrice * b.quantity
                    )
                    .reduce((a, b) => a + b, 0)
                )
                .reduce((a, b) => a + b, 0),
            });
          }

          if (brand) {
            return res.status(200).json({
              startDate: startDate1.toISOString(),
              endDate: endDate1.toISOString(),
              seller: seller,
              brand: brand,
              stateList: stateList,
              orders: returnOrder,
              stats: {
                totalAmount,
                totalOrders,
                totalUnitSold,
                totalUniqueBuyers,
                totalAuctions,
              },
              monthStats: monthStats,
            });
          } else {
            return res.status(400).json(NotAvailable);
          }

        default:
          return res.status(501).json(NotAvailable);
          break;
      }
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
