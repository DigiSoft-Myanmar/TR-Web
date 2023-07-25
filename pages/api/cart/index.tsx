// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import { CartItem, ShippingFee } from "@/prisma/models/cartItems";
import prisma from "@/prisma/prisma";
import { BadRequest, Success, Unauthorized } from "@/types/ApiResponseTypes";
import { DeliveryType, ImgType, OrderStatus } from "@/types/orderTypes";
import { OrderPermission } from "@/types/permissionTypes";
import { isBuyer } from "@/util/authHelper";
import {
  addNotification,
  getAdminIdList,
  getStaffIdList,
} from "@/util/notiHelper";
import { getPricing, getPricingSingle } from "@/util/pricing";
import {
  NotiType,
  Product,
  ProductType,
  Role,
  StockType,
  Term,
} from "@prisma/client";
import _ from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { render } from "@react-email/render";
import async from "async";
import { sendEmailNodeFn, sendOrderEmail } from "@/util/emailNodeHelper";
import OrderEmail from "@/emails/order";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);

    if (session) {
      if (isBuyer(session)) {
        switch (req.method) {
          case "GET":
            let cartData: any = await prisma.cartItems.findFirst({
              where: {
                userId: session.id,
              },
            });
            let billingAddress: any = {
              name: session.username,
              phoneNum: session.phoneNum,
              email: session.email,
              houseNo: session.houseNo,
              street: session.street,
              stateId: session.stateId,
              districtId: session.districtId,
              townshipId: session.townshipId,
            };
            let shippingAddress: any = {};
            let isAddressDiff = false;
            let shippingFee: ShippingFee[] = [];
            let prods: Product[] = [];
            let prodDetails: Product[] = [];
            let cartItems: any[] = [];

            let auctionData: any = await prisma.auctionList.findFirst({
              where: {
                userId: session.id,
              },
            });
            let dz: any[] = [];
            if (cartData) {
              dz = [...cartData.cartItems];
            }
            if (auctionData) {
              dz = [...dz];
              for (let k = 0; k < auctionData.auctionList.length; k++) {
                let a = auctionData.auctionList[k];
                if (
                  dz.find(
                    (z) =>
                      z.productId === a.productId && z.auctionId === a.auctionId
                  )
                ) {
                } else {
                  dz.push(a);
                }
              }
            }

            let list = [...dz];

            if (list.length > 0) {
              for (let i = 0; i < list.length; i++) {
                let p = await prisma.product.findFirst({
                  include: {
                    Brand: true,
                    seller: true,
                  },
                  where: {
                    id: list[i].productId,
                    seller: {
                      sellAllow: true,
                    },
                    isPublished: true,
                  },
                });
                if (p) {
                  prodDetails.push(p);
                }
              }

              billingAddress = {
                ...billingAddress,
                ...cartData.billingAddress,
              };

              shippingAddress = {
                ...shippingAddress,
                ...cartData.shippingAddress,
              };
              if (cartData.shippingFee) {
                shippingFee = cartData.shippingFee;
              }

              if (cartData.isAddressDiff === true) {
                isAddressDiff = true;
              } else {
                isAddressDiff = false;
              }
              let sellerIds = Array.from(
                new Set(prodDetails.map((e: any) => e.sellerId))
              );
              for (let j = 0; j < prodDetails.length; j++) {
                if (prodDetails[j].type === ProductType.Fixed) {
                  let c: any = cartData.cartItems.find(
                    (e: any) => e.productId === prodDetails[j].id
                  );
                  if (
                    prodDetails[j].stockType === StockType.InStock ||
                    (prodDetails[j].stockType === StockType.StockLevel &&
                      prodDetails[j].stockLevel! >= c.quantity)
                  ) {
                    let pricing = getPricing(prodDetails[j]);
                    if (pricing?.isPromotion === true) {
                      cartItems.push({
                        ...c,
                        normalPrice: pricing.regularPrice,
                        salePrice: pricing.saleAmount,
                      });
                    } else {
                      if (c.salePrice) {
                        delete c.salePrice;
                      }
                      cartItems.push({
                        ...c,
                        normalPrice: pricing.regularPrice,
                      });
                    }
                    prods.push(prodDetails[j]);
                    dz.splice(c, 1);
                  }
                } else if (prodDetails[j].type === ProductType.Variable) {
                  let cIndex: any = dz.findIndex(
                    (e: any) =>
                      e.productId === prodDetails[j].id &&
                      prodDetails[j].variations.find((z: any) =>
                        _.isEqual(
                          _.sortBy(z.attributes, (o) => o.attributeId),
                          _.sortBy(e.variation.attributes, (o) => o.attributeId)
                        )
                      )
                  );
                  let c = dz[cIndex];
                  let attributes = c.variation.attributes;

                  let variation: any = prodDetails[j].variations.find(
                    (e: any) =>
                      _.isEqual(
                        _.sortBy(e.attributes, (o) => o.attributeId),
                        _.sortBy(attributes, (o) => o.attributeId)
                      )
                  );
                  if (variation) {
                    if (
                      variation.stockType === StockType.InStock ||
                      (variation.stockType === StockType.StockLevel &&
                        variation.stockLevel! >= c.quantity)
                    ) {
                      let pricing = getPricingSingle(variation);
                      if (pricing?.isPromotion === true) {
                        cartItems.push({
                          ...c,
                          normalPrice: pricing.regularPrice,
                          salePrice: pricing.saleAmount,
                        });
                      } else {
                        if (c.salePrice) {
                          delete c.salePrice;
                        }
                        cartItems.push({
                          ...c,
                          normalPrice: pricing.regularPrice,
                        });
                      }
                      prods.push(prodDetails[j]);
                      dz.splice(c, 1);
                    }
                  } else {
                    let allAnyIndex = prodDetails[j].variations.findIndex(
                      (e: any) =>
                        e.attributes.every((z: any) => z.name === "Any")
                    );
                    let variations: any = [...prodDetails[j].variations];
                    if (allAnyIndex >= 0) {
                      variations.splice(allAnyIndex, 1);
                    }
                    let v = undefined;
                    for (
                      let i = 0;
                      i < variations.length && v === undefined;
                      i++
                    ) {
                      let otherAttribute = variations[i].attributes.filter(
                        (e: any) => e.name !== "Any"
                      );
                      let attr = attributes.filter((e: any) =>
                        otherAttribute.find(
                          (o: any) => o.attributeId === e.attributeId
                        )
                      );
                      let isEqual = _.isEqual(
                        _.sortBy(otherAttribute, (o) => o.attributeId),
                        _.sortBy(attr, (o) => o.attributeId)
                      );
                      if (isEqual === true) {
                        v = variations[i];
                        if (
                          v.stockType === StockType.InStock ||
                          (v.stockType === StockType.StockLevel &&
                            v.stockLevel! >= c.quantity)
                        ) {
                          let pricing = getPricingSingle(v);
                          if (pricing?.isPromotion === true) {
                            cartItems.push({
                              ...c,
                              normalPrice: pricing.regularPrice,
                              salePrice: pricing.saleAmount,
                            });
                          } else {
                            if (c.salePrice) {
                              delete c.salePrice;
                            }
                            cartItems.push({
                              ...c,
                              normalPrice: pricing.regularPrice,
                            });
                          }
                          prods.push(prodDetails[j]);
                        }
                      } else {
                        v = undefined;
                      }
                    }
                    if (v) {
                    } else if (allAnyIndex >= 0) {
                      let currentVariation: any =
                        prodDetails[j].variations[allAnyIndex];
                      if (
                        currentVariation.stockType === StockType.InStock ||
                        (currentVariation.stockType === StockType.StockLevel &&
                          currentVariation.stockLevel! >= c.quantity)
                      ) {
                        let pricing = getPricingSingle(currentVariation);
                        if (pricing?.isPromotion === true) {
                          cartItems.push({
                            ...c,
                            normalPrice: pricing.regularPrice,
                            salePrice: pricing.saleAmount,
                          });
                        } else {
                          if (c.salePrice) {
                            delete c.salePrice;
                          }
                          cartItems.push({
                            ...c,
                            normalPrice: pricing.regularPrice,
                          });
                        }
                        prods.push(prodDetails[j]);
                      }
                    }
                  }
                } else if (prodDetails[j].type === ProductType.Auction) {
                  let c: any = auctionData.auctionList.find(
                    (e: any) => e.productId === prodDetails[j].id
                  );
                  cartItems.push({
                    ...c,
                  });
                  prods.push(prodDetails[j]);
                  dz.splice(c, 1);
                }
              }
              for (let b = 0; b < sellerIds.length; b++) {
                if (
                  isAddressDiff === true &&
                  shippingAddress.stateId &&
                  shippingAddress.districtId &&
                  shippingAddress.townshipId
                ) {
                  await fetch(
                    process.env.NEXTAUTH_URL +
                      "/api/shippingCost?sellerId=" +
                      sellerIds[b] +
                      "&state=" +
                      shippingAddress.stateId +
                      "&district=" +
                      shippingAddress.districtId +
                      "&township=" +
                      shippingAddress.townshipId
                  )
                    .then((data) => data.json())
                    .then((json) => {
                      let exists = shippingFee.findIndex(
                        (e) => e.sellerId === sellerIds[b]
                      );
                      if (exists >= 0) {
                        if (json.shippingCost! >= 0) {
                          shippingFee[exists].shippingFee = json.shippingCost;
                        } else {
                          shippingFee[exists].shippingFee =
                            json.defaultShippingCost;
                        }
                        if (json.isOfferFreeShipping === true) {
                          let subTotal = cartItems
                            .filter((e: any) => e.sellerId === sellerIds[b])
                            .map((e: any) =>
                              e.salePrice
                                ? e.salePrice * e.quantity
                                : e.normalPrice * e.quantity
                            )
                            .reduce((a, b) => a + b, 0);

                          if (subTotal >= json.freeShippingCost) {
                            shippingFee[exists].isFreeShipping = true;
                          } else {
                            shippingFee[exists].isFreeShipping = false;
                          }
                        } else {
                          shippingFee[exists].isFreeShipping = false;
                        }
                      } else {
                        let freeShipping = false;
                        if (json.isOfferFreeShipping === true) {
                          let subTotal = cartItems
                            .filter((e: any) => e.sellerId === sellerIds[b])
                            .map((e: any) =>
                              e.salePrice
                                ? e.salePrice * e.quantity
                                : e.normalPrice * e.quantity
                            )
                            .reduce((a, b) => a + b, 0);
                          if (subTotal >= json.freeShippingCost) {
                            freeShipping = true;
                          }
                        }
                        if (json.shippingIncluded === true) {
                          shippingFee.push({
                            sellerId: sellerIds[b],
                            deliveryType: DeliveryType.DoorToDoor,
                            isFreeShipping: freeShipping,
                            shippingFee: undefined,
                          });
                        } else {
                          shippingFee.push({
                            sellerId: sellerIds[b],
                            deliveryType: DeliveryType.DoorToDoor,
                            isFreeShipping: freeShipping,
                            shippingFee: undefined,
                          });
                        }
                      }
                    });
                } else if (
                  billingAddress.stateId &&
                  billingAddress.districtId &&
                  billingAddress.townshipId
                ) {
                  await fetch(
                    process.env.NEXTAUTH_URL +
                      "/api/shippingCost?sellerId=" +
                      sellerIds[b] +
                      "&state=" +
                      billingAddress.stateId +
                      "&district=" +
                      billingAddress.districtId +
                      "&township=" +
                      billingAddress.townshipId
                  )
                    .then((data) => data.json())
                    .then((json) => {
                      let exists = shippingFee.findIndex(
                        (e) => e.sellerId === sellerIds[b]
                      );

                      if (exists >= 0) {
                        if (json.shippingCost! >= 0) {
                          shippingFee[exists].shippingFee = json.shippingCost;
                        } else {
                          shippingFee[exists].shippingFee =
                            json.defaultShippingCost;
                        }
                        if (json.isOfferFreeShipping === true) {
                          let subTotal = cartItems
                            .filter((e: any) => e.sellerId === sellerIds[b])
                            .map((e: any) =>
                              e.salePrice
                                ? e.salePrice * e.quantity
                                : e.normalPrice * e.quantity
                            )
                            .reduce((a, b) => a + b, 0);
                          if (subTotal >= json.freeShippingCost) {
                            shippingFee[exists].isFreeShipping = true;
                          } else {
                            shippingFee[exists].isFreeShipping = false;
                          }
                        } else {
                          shippingFee[exists].isFreeShipping = false;
                        }
                      } else {
                        let freeShipping = false;
                        if (json.isOfferFreeShipping === true) {
                          let subTotal = cartItems
                            .filter((e: any) => e.sellerId === sellerIds[b])
                            .map((e: any) =>
                              e.salePrice
                                ? e.salePrice * e.quantity
                                : e.normalPrice * e.quantity
                            )
                            .reduce((a, b) => a + b, 0);
                          if (subTotal >= json.freeShippingCost) {
                            freeShipping = true;
                          }
                        }
                        if (json.shippingIncluded === true) {
                          shippingFee.push({
                            sellerId: sellerIds[b],
                            deliveryType: DeliveryType.DoorToDoor,
                            isFreeShipping: freeShipping,
                            shippingFee: json.defaultShippingCost,
                          });
                        } else {
                          shippingFee.push({
                            sellerId: sellerIds[b],
                            deliveryType: DeliveryType.DoorToDoor,
                            isFreeShipping: freeShipping,
                            shippingFee: undefined,
                          });
                        }
                      }
                    });
                }
              }
            } else {
              let order = await prisma.order.findFirst({
                where: {
                  orderByUserId: session.id,
                },
                orderBy: {
                  orderNo: "desc",
                },
              });
              if (order) {
                billingAddress = order.billingAddress;
                shippingAddress = order.shippingAddress;
                isAddressDiff = order.isAddressDiff;
              }
            }

            return res.status(200).json({
              cartItems: cartItems,
              billingAddress: billingAddress,
              shippingAddress: shippingAddress,
              isAddressDiff: isAddressDiff,
              shippingFee: shippingFee,
              prodDetails: prods,
            });
            break;
          case "POST":
            let { type } = req.query;
            if (type === "Order") {
              let body: any = {};
              if (typeof req.body === "object") {
                body = req.body;
              } else {
                body = JSON.parse(req.body);
              }
              let data = await prisma.cartItems.findFirst({
                where: {
                  userId: session.id,
                },
              });

              if (data) {
                let currentOrder = await prisma.order.findFirst({
                  orderBy: {
                    orderNo: "desc",
                  },
                });
                let orderNo = 1;
                if (currentOrder) {
                  orderNo = currentOrder.orderNo + 1;
                }
                let sellerResponse: any = [];

                let sellerIds = Array.from(
                  new Set(data.cartItems.map((e: any) => e.sellerId))
                );
                for (let i = 0; i < sellerIds.length; i++) {
                  let brandFee: any = data.shippingFee.find(
                    (e: any) => e.sellerId === sellerIds[i]
                  );
                  sellerResponse.push({
                    sellerId: sellerIds[i],
                    deliveryType: brandFee.deliveryType,
                    isFreeShipping: brandFee.isFreeShipping,
                    shippingFee: brandFee.shippingFee,
                    statusHistory: [
                      {
                        status: OrderStatus.OrderReceived,
                        updatedDate: new Date().toISOString(),
                        updatedBy: data.userId,
                      },
                    ],
                  });
                }

                const system = await prisma.user.findFirst({
                  where: {
                    role: Role.SuperAdmin,
                  },
                });

                let discountTotal = [];
                if (body.promoIds) {
                  for (let i = 0; i < body.promoIds.length; i++) {
                    const promoCode = await prisma.promoCode.findFirst({
                      where: {
                        id: body.promoIds[i],
                      },
                    });
                    if (promoCode) {
                      let orderCount = await prisma.order.count({
                        where: {
                          promoIds: {
                            has: body.promoIds[i],
                          },
                        },
                      });
                      let promoValid = true;
                      if (
                        promoCode.isCouponUsageInfinity === false &&
                        promoCode.couponUsage > 0 &&
                        promoCode.couponUsage <= orderCount
                      ) {
                        promoValid = false;
                      }
                      if (
                        promoCode.isCouponUsagePerUserInfinity === false &&
                        promoCode.couponUsagePerUser > 0 &&
                        promoCode.couponUsagePerUser <= orderCount
                      ) {
                        promoValid = false;
                      }

                      if (promoValid === true) {
                        let cartItem = data.cartItems.filter(
                          (z: any) => z.sellerId === promoCode.sellerId
                        );

                        let total = cartItem
                          .map((e: any) =>
                            e.salePrice
                              ? e.salePrice * e.quantity
                              : e.normalPrice * e.quantity
                          )
                          .reduce((a, b) => a + b, 0);

                        if (total >= promoCode.minimumPurchasePrice) {
                          if (promoCode.isShippingFree === true) {
                            let index = sellerResponse.findIndex(
                              (z) => z.sellerId === promoCode.sellerId
                            );
                            if (index >= 0) {
                              sellerResponse[index].isFreeShipping = true;
                            }
                          }
                          if (promoCode.isPercent === true) {
                            discountTotal.push({
                              sellerId: promoCode.sellerId,
                              discount: (promoCode.discount * total) / 100,
                            });
                          } else {
                            discountTotal.push({
                              sellerId: promoCode.sellerId,
                              discount: promoCode.discount,
                            });
                          }
                        }
                      }
                    }
                  }
                }
                let user = await prisma.user.findFirst({
                  where: {
                    id: data?.userId,
                  },
                });
                let billingInfo = await prisma.userAddress.findFirst({
                  where: {
                    userId: data?.userId,
                    isBillingAddress: true,
                  },
                });
                let shippingAddress = await prisma.userAddress.findMany({
                  where: {
                    userId: data?.userId,
                    isBillingAddress: false,
                  },
                });
                console.log(data.cartItems);

                let newOrder = await prisma.order.create({
                  data: {
                    orderNo: orderNo,
                    billingAddress: data.billingAddress!,
                    shippingAddress: data.shippingAddress
                      ? data.shippingAddress
                      : {},
                    cartItems: data.cartItems,
                    isAddressDiff: data.isAddressDiff,
                    orderByUserId: data.userId,
                    sellerResponse: sellerResponse,
                    discountTotal: discountTotal,
                    promoIds: body?.promoIds,
                    sellerIds: sellerIds,
                    buyerNote: body?.orderNote,
                  },
                  include: {
                    orderBy: true,
                  },
                });

                let auctionL = await prisma.auctionList.findFirst({
                  where: {
                    userId: data!.userId,
                  },
                });
                if (auctionL) {
                  let list: any = auctionL.auctionList;

                  for (let index = 0; index < data.cartItems.length; index++) {
                    let aItem: any = data.cartItems[index];
                    if (aItem) {
                      if (aItem.isAuction === true) {
                        list = list.filter(
                          (z) => z.auctionId !== aItem.auctionId
                        );
                      }
                    }
                  }

                  await prisma.auctionList.update({
                    where: {
                      userId: data!.userId,
                    },
                    data: {
                      auctionList: list,
                    },
                  });
                }

                await prisma.cartItems.update({
                  where: {
                    userId: data!.userId,
                  },
                  data: {
                    cartItems: [],
                  },
                });

                let updateInfo: any = {};
                let isUpdate = false;
                let order: any = { ...data };

                if (user && !user.email) {
                  updateInfo.email = order!.billingAddress!.email;
                  isUpdate = true;
                }
                if (user && !user.stateId) {
                  updateInfo.stateId = order!.billingAddress!.stateId;
                  isUpdate = true;
                }
                if (user && !user.districtId) {
                  updateInfo.districtId = order!.billingAddress!.districtId;
                  isUpdate = true;
                }
                if (user && !user.townshipId) {
                  updateInfo.townshipId = order!.billingAddress!.townshipId;
                  isUpdate = true;
                }
                if (user && !user.houseNo) {
                  updateInfo.houseNo = order!.billingAddress!.houseNo;
                  isUpdate = true;
                }
                if (user && !user.street) {
                  updateInfo.street = order!.billingAddress!.street;
                  isUpdate = true;
                }
                if (isUpdate === true) {
                  await prisma.user.update({
                    where: {
                      id: user!.id,
                    },
                    data: updateInfo,
                  });
                }

                if (!billingInfo) {
                  await prisma.userAddress.create({
                    data: {
                      ...order!.billingAddress,
                      userId: data?.userId,
                      addressName: "Billing Address",
                      isBillingAddress: true,
                    },
                  });
                }
                if (order.isAddressDiff === true) {
                  let shipping = order.shippingAddress;
                  if (
                    shippingAddress.length < 3 &&
                    shippingAddress.find(
                      (e) =>
                        e.stateId !== shipping.stateId ||
                        e.districtId !== shipping.districtId ||
                        e.townshipId !== shipping.townshipId ||
                        e.houseNo !== shipping.houseNo ||
                        e.street !== shipping.street ||
                        e.phoneNum !== shipping.phoneNum ||
                        e.name !== shipping.name
                    )
                  ) {
                    await prisma.userAddress.create({
                      data: {
                        ...order!.shippingAddress,
                        userId: data?.userId,
                        addressName: "Shipping Address",
                        isBillingAddress: false,
                      },
                    });
                  }
                }

                let adminList = await getAdminIdList();
                let staffList = await getStaffIdList(
                  OrderPermission.orderNotiAllow
                );

                let msg: any = {
                  body:
                    newOrder.orderBy.username +
                    " created a new order with #" +
                    newOrder.orderNo +
                    " at " +
                    new Date().toLocaleDateString("en-ca", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  createdAt: new Date().toISOString(),
                  title: "New Order #" + newOrder.orderNo,
                  type: NotiType.NewOrder,
                  requireInteraction: false,
                  sendList: [
                    ...adminList,
                    ...staffList,
                    newOrder.orderByUserId,
                    ...sellerIds,
                  ],
                  details: {
                    web: "/orders/" + encodeURIComponent(newOrder.orderNo),
                    mobile: {
                      screen: "Orders",
                      slug: newOrder.orderNo,
                    },
                  },
                };
                await addNotification(msg, "");
                await sendOrderEmail(newOrder, "New Order " + newOrder.orderNo);

                return res.status(200).json({
                  orderNo: newOrder.orderNo,
                });
              } else {
                return res.status(400).json(BadRequest);
              }
            } else {
              let body: any = {};
              if (typeof req.body === "object") {
                body = req.body;
              } else {
                body = JSON.parse(req.body);
              }
              let b = { ...body };

              if (b.user) {
                delete b.user;
              }
              b.userId = session.id;
              let cartItem = await prisma.cartItems.findFirst({
                where: {
                  userId: session.id,
                },
              });
              if (cartItem) {
                await prisma.cartItems.update({
                  where: {
                    userId: session.id,
                  },
                  data: b,
                });
              } else {
                await prisma.cartItems.create({
                  data: {
                    billingAddress: {},
                    isAddressDiff: false,
                    shippingAddress: {},
                    ...b,
                  },
                });
              }

              return res.status(200).json(Success);
            }
            break;
        }
      } else {
        return res.status(401).json(Unauthorized);
      }
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
