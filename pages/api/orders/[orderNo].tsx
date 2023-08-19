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
import { OrderPermission, ProductPermission } from "@/types/permissionTypes";
import { hasPermission, isInternal, isSeller } from "@/util/authHelper";
import { sendOrderEmail } from "@/util/emailNodeHelper";
import {
  addNotification,
  getAdminIdList,
  getStaffIdList,
} from "@/util/notiHelper";
import { NotiType, Order, ProductType, Role, StockType } from "@prisma/client";
import { sortBy } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { addCartItems } from ".";

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
  let conf = await prisma.configuration.findFirst({});
  let lowStock = conf?.lowStockLimit ? conf.lowStockLimit : 10;

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
        if (stockLevel <= lowStock) {
          let adminList = await getAdminIdList();
          let staffList = await getStaffIdList(
            ProductPermission.productNotiAllow
          );

          let msg: any = {
            body:
              product.name +
              " was low on stock. Current Stock Qty is " +
              stockLevel,
            createdAt: new Date().toISOString(),
            title: "Low Stock: " + product.name,
            type: NotiType.LowStock,
            requireInteraction: false,
            sendList: [...adminList, ...staffList, product.sellerId],
            details: {
              web: "/products/" + encodeURIComponent(product.slug),
              mobile: {
                screen: "ProductUpdate",
                slug: product.slug,
              },
            },
          };
          await addNotification(msg, "");
        }

        await prisma.product.update({
          where: { id: product.id },
          data: {
            stockLevel: stockLevel,
          },
        });
      } else if (product.type === ProductType.Variable) {
        let variableIndex: any = product.variations.findIndex(
          (z: any) => z.SKU === cartItems[i].variation.SKU
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

            if (stockLevel <= lowStock) {
              let adminList = await getAdminIdList();
              let staffList = await getStaffIdList(
                ProductPermission.productNotiAllow
              );

              let msg: any = {
                body:
                  product.name +
                  " was low on stock. Current Stock Qty is " +
                  stockLevel,
                createdAt: new Date().toISOString(),
                title: "Low Stock: " + product.name,
                type: NotiType.LowStock,
                requireInteraction: false,
                sendList: [...adminList, ...staffList, product.sellerId],
                details: {
                  web: "/products/" + encodeURIComponent(product.slug),
                  mobile: {
                    screen: "ProductUpdate",
                    slug: product.slug,
                  },
                },
              };
              await addNotification(msg, "");
            }

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
    const { orderNo, sellerId, status } = req.query;
    if (orderNo) {
      if (session) {
        let order: any = await prisma.order.findFirst({
          where: {
            orderNo: parseInt(orderNo.toString()),
          },
          include: {
            orderBy: true,
            promoCodes: true,
          },
        });
        if (order) {
          switch (req.method) {
            case "GET":
              order = await addCartItems(order);
              const sellerList = [];

              if (order) {
                for (let i = 0; i < order.cartItems.length; i++) {
                  let item: any = order.cartItems[i];
                  let prod = await prisma.product.findFirst({
                    where: {
                      id: item.productId,
                    },
                    include: {
                      seller: true,
                      Brand: true,
                      Condition: true,
                    },
                  });
                  order.cartItems[i].id = i + 1;
                  if (prod) {
                    order.cartItems[i].productInfo = prod;
                  }
                }
                for (let i = 0; i < order.sellerResponse.length; i++) {
                  let item: any = order.sellerResponse[i];
                  let s = sortBy(
                    item.statusHistory,
                    (obj: any) => obj.updatedDate
                  ).reverse()[0];
                  let b = await prisma.brand.findFirst({
                    where: {
                      id: item.brandId,
                    },
                  });

                  for (let j = 0; j < item.statusHistory.length; j++) {
                    let statusItem = item.statusHistory[j];

                    if (statusItem.updatedBy) {
                      let user = await prisma.user.findFirst({
                        where: {
                          id: statusItem.updatedBy,
                        },
                      });
                      if (user) {
                        item.statusHistory[j].updatedUser = user;
                      }
                    } else {
                      item.statusHistory[j].updatedUser = {
                        username: "System",
                        role: Role.System,
                      };
                    }
                  }

                  let seller = await prisma.user.findFirst({
                    where: {
                      id: item.sellerId,
                    },
                  });
                  if (seller) {
                    sellerList.push(seller);
                  }
                }
              }

              return res.status(200).json({
                sellerList: JSON.parse(JSON.stringify(sellerList)),
                order: JSON.parse(JSON.stringify(order)),
              });
            case "PUT":
              if (isSeller(session) || isInternal(session)) {
                if (
                  session.role === Role.Staff &&
                  !hasPermission(session, OrderPermission.orderUpdateAllow)
                ) {
                  return res.status(401).json(Unauthorized);
                }
                const seller = await prisma.user.findFirst({
                  where: {
                    id: sellerId.toString(),
                  },
                });

                let body: any = {};
                if (typeof req.body === "object") {
                  body = req.body;
                } else {
                  body = JSON.parse(req.body);
                }
                let newOrder: any = await prisma.order.update({
                  where: {
                    id: order.id,
                  },
                  data: {
                    sellerResponse: body.sellerResponse,
                  },
                });

                let adminList = await getAdminIdList();
                let staffList = await getStaffIdList(
                  OrderPermission.orderNotiAllow
                );

                let msg: any = {
                  body:
                    seller.username +
                    " changed the status to " +
                    status.toString() +
                    " for Order #" +
                    newOrder.orderNo +
                    " at " +
                    new Date().toLocaleDateString("en-ca", {
                      timeZone: "Asia/Yangon",
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  createdAt: new Date().toISOString(),
                  title:
                    seller.username +
                    " " +
                    status.toString() +
                    " Order #" +
                    newOrder.orderNo,
                  type: NotiType.UpdateOrder,
                  requireInteraction: false,
                  sendList: [
                    ...adminList,
                    ...staffList,
                    newOrder.orderByUserId,
                    sellerId,
                  ],
                  details: {
                    web: "/orders/" + encodeURIComponent(order.orderNo),
                    mobile: {
                      screen: "Orders",
                      slug: order.orderNo,
                    },
                  },
                };
                await addNotification(msg, "");
                await sendOrderEmail(
                  newOrder,
                  seller.username +
                    " " +
                    status.toString() +
                    " Order #" +
                    newOrder.orderNo
                );

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
