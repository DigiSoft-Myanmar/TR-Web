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
import { OrderStatus } from "@/types/orderTypes";
import { isInternal, isSeller } from "@/util/authHelper";
import { Order, ProductType, Role, StockType } from "@prisma/client";
import { sortBy } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";

async function addUnitSold(order: any, sellerId: string) {
  let cartItems = order.cartItems.filter((z: any) => z.sellerId === sellerId);
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < cartItems.length; i++) {
    let unitSold = await prisma.unitSold.findFirst({
      where: {
        productId: cartItems[i].productId,
        purchasedDate: today,
        regularPrice: cartItems[i].regularPrice,
        isDiscount: cartItems[i].salePrice ? true : false,
        soldPrice: cartItems[i].salePrice
          ? cartItems[i].salePrice
          : cartItems[i].regularPrice,
      },
    });
    if (unitSold) {
      let soldUnit = unitSold.soldUnit;
      await prisma.unitSold.update({
        where: {
          id: unitSold.id,
        },
        data: {
          soldUnit: soldUnit + cartItems[i].quantity,
        },
      });
    } else {
      await prisma.unitSold.create({
        data: {
          productId: cartItems[i].productId,
          purchasedDate: today,
          regularPrice: cartItems[i].regularPrice,
          isDiscount: cartItems[i].salePrice ? true : false,
          soldUnit: cartItems[i].quantity,
          soldPrice: cartItems[i].salePrice
            ? cartItems[i].salePrice
            : cartItems[i].regularPrice,
        },
      });
    }
  }
}

async function modifyStock(order: any, sellerId: string, isReduce: boolean) {
  let cartItems = order.cartItems.filter((z: any) => z.sellerId === sellerId);
  for (let i = 0; i < cartItems.length; i++) {
    let product = await prisma.product.findFirst({
      where: {
        id: cartItems[i].productId,
      },
    });
    if (product) {
      if (
        product.type === ProductType.Fixed &&
        product.stockType === StockType.StockLevel
      ) {
        let stockLevel = product.stockLevel;
        if (isReduce === true) {
          if (stockLevel - cartItems[i].quantity >= 0) {
            stockLevel = stockLevel - cartItems[i].quantity;
          } else {
            stockLevel = 0;
          }
        } else {
          stockLevel = stockLevel + cartItems[i].quantity;
        }

        await prisma.product.update({
          where: { id: product.id },
          data: {
            stockLevel: stockLevel,
          },
        });
      } else if (product.type === ProductType.Variable) {
        let variableIndex: any = product.variations.findIndex(
          (z: any) => (z.SKU = cartItems[i].variation.SKU)
        );
        let variations: any = [...product.variations];
        if (variableIndex >= 0) {
          let variable: any = variations[variableIndex];
          if (variable && variable.stockType === StockType.StockLevel) {
            let stockLevel = variable.stockLevel;
            if (isReduce === true) {
              if (stockLevel - cartItems[i].quantity >= 0) {
                stockLevel = stockLevel - cartItems[i].quantity;
              } else {
                stockLevel = 0;
              }
            } else {
              stockLevel = stockLevel + cartItems[i].quantity;
            }
            variations[variableIndex].stockLevel = stockLevel;
            await prisma.product.update({
              where: { id: product.id },
              data: {
                variations: variations,
              },
            });
          }
        }
      }
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    const { orderNo } = req.query;
    if (orderNo) {
      if (session) {
        let order = await prisma.order.findFirst({
          where: {
            orderNo: parseInt(orderNo.toString()),
          },
        });
        if (order) {
          switch (req.method) {
            case "GET":
              return res.status(200).json(Success);
            case "PUT":
              if (isSeller(session) || isInternal(session)) {
                let body = JSON.parse(req.body);
                let newOrder: any = await prisma.order.update({
                  where: {
                    id: order.id,
                  },
                  data: {
                    sellerResponse: body.sellerResponse,
                  },
                });
                if (newOrder.sellerResponse) {
                  for (let i = 0; i < newOrder.sellerResponse.length; i++) {
                    let orderStatus = sortBy(
                      newOrder.sellerResponse[i].statusHistory,
                      (e) => e.updatedDate
                    ).reverse()[0];

                    if (orderStatus.status === OrderStatus.Accepted) {
                      // If the order is accepted, reduce the stock items
                      await modifyStock(
                        newOrder,
                        newOrder.sellerResponse[i].sellerId,
                        true
                      );
                    } else if (orderStatus.status === OrderStatus.Shipped) {
                      let status = newOrder.sellerResponse[
                        i
                      ].statusHistory.find(
                        (z) => z.status === OrderStatus.Accepted
                      );
                      await addUnitSold(
                        newOrder,
                        newOrder.sellerResponse[i].sellerId
                      );
                      if (status) {
                        // If the order is shipped and accepted, do nothing
                        // since the stock items are already reduced
                        // No action required
                        console.log("HERE");
                      } else {
                        // If the order is shipped but not accepted, reduce the stock items
                        console.log("HERE");

                        await modifyStock(
                          newOrder,
                          newOrder.sellerResponse[i].sellerId,
                          true
                        );
                      }
                    } else if (orderStatus.status === OrderStatus.Rejected) {
                      // If the order is rejected, increase the stock items
                      console.log("HERE");

                      await modifyStock(
                        newOrder,
                        newOrder.sellerResponse[i].sellerId,
                        false
                      );
                    }
                  }
                }
                return res.status(200).json(Success);
              } else {
                return res.status(401).json(Unauthorized);
              }
          }
        } else {
          return res.status(404).json(NotAvailable);
        }
      } else {
        return res.status(401).json(Unauthorized);
      }
    } else {
      return res.status(400).json(BadRequest);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
