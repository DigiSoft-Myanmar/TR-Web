// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import { getConfiguration } from "@/prisma/models/configuration";
import {
  createAttribute,
  createProduct,
  getAllAttributes,
  getAllCategories,
  getAllProducts,
  getFeaturedProducts,
  getProductsBySeller,
  updateAttribute,
  updateProduct,
} from "@/prisma/models/product";
import prisma from "@/prisma/prisma";
import {
  BadRequest,
  Exists,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { PageType } from "@/types/pageType";
import { AuctionPermission, ProductPermission } from "@/types/permissionTypes";
import { hasPermission, isInternal, isSeller } from "@/util/authHelper";
import {
  addNotification,
  getAdminIdList,
  getStaffIdList,
} from "@/util/notiHelper";
import { getPricing } from "@/util/pricing";
import {
  Membership,
  NotiType,
  ProductType,
  Role,
  StockType,
} from "@prisma/client";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    let session = await useAuth(req);
    switch (req.method) {
      case "GET":
        const { type, sellerId, isFeatured, id: recentId, isHome } = req.query;
        if (type === PageType.Featured) {
          let prods = await getFeaturedProducts();
          return res
            .status(200)
            .json(
              prods.filter((e) =>
                !session || session.role === Role.Buyer
                  ? e.isPublished === true
                  : true
              )
            );
        }
        if (type === "recent" && recentId) {
          let idList = [];
          if (typeof recentId === "string") {
            idList = [recentId];
          } else {
            idList = recentId;
          }

          let prods = await prisma.product.findMany({
            include: {
              seller: true,
              categories: {
                include: {
                  subCategory: true,
                },
              },
              Review: true,
            },
            where: {
              seller: {
                sellAllow: true,
                isBlocked: false,
                isDeleted: false,
              },
              isPublished: true,
              id: {
                in: idList,
              },
            },
          });
          return res
            .status(200)
            .json(
              prods.filter((e) =>
                !session || session.role === Role.Buyer
                  ? e.isPublished === true
                  : true
              )
            );
        } else if (type === "recent") {
          return res.status(200).json([]);
        }

        if (sellerId) {
          if (isHome === "true") {
            let prods = await getProductsBySeller(sellerId.toString());
            return res
              .status(200)
              .json(
                prods.filter((e) =>
                  isInternal(session) ||
                  (session && session.id === sellerId.toString())
                    ? true
                    : e.isPublished === true
                )
              );
          } else {
            let prods = await getProductsBySeller(sellerId.toString());
            return res
              .status(200)
              .json(
                prods.filter((e) =>
                  !session || session.role === Role.Buyer
                    ? e.isPublished === true
                    : true
                )
              );
          }
        }
        if (
          session.role === Role.Staff &&
          !hasPermission(session, ProductPermission.productViewAllow)
        ) {
          return res.status(401).json(Unauthorized);
        }

        let products: any = await getAllProducts(
          session &&
            (session.role === Role.Seller || session.role === Role.Trader)
            ? session.id
            : "",
          session,
          type?.toString()
        );
        for (let i = 0; i < products.length; i++) {
          products[i].action = {
            id: products[i].id,
            slug: products[i].slug,
          };
          let stock: any = StockType.InStock;
          products[i].status = {
            isFeatured: products[i].isFeatured,
            isPublished: products[i].seller
              ? products[i].seller.sellAllow === true
                ? products[i].isPublished
                : false
              : false,
            sellAllow: products[i].seller
              ? products[i].seller.sellAllow
              : false,
          };

          let configuration = await getConfiguration();

          if (products[i].type === ProductType.Fixed) {
            if (products[i].stockType === StockType.StockLevel) {
              if (products[i].stockLevel !== 0) {
                if (configuration && configuration.lowStockLimit) {
                  if (configuration.lowStockLimit >= products[i].stockLevel) {
                    stock = "Low Stock";
                  } else {
                    stock = StockType.InStock;
                  }
                }
              } else {
                stock = StockType.OutOfStock;
              }
            } else {
              stock = products[i].stockType;
            }
          } else if (products[i].type === ProductType.Variable) {
            let atLeastOneInStock =
              products[i].variations.filter(
                (e: any) => e.stockType === StockType.InStock
              ).length > 0;
            let atLeastOneOutOfStock =
              products[i].variations.filter(
                (e: any) => e.stockType === StockType.OutOfStock
              ).length > 0;
            let stockLevel = products[i].variations
              .filter((e: any) => e.stockType === StockType.StockLevel)
              .map((z: any) => z.stockLevel)
              .reduce((a: number, b: number) => a + b, 0);
            if (atLeastOneInStock) {
              stock = StockType.InStock;
            } else if (atLeastOneOutOfStock) {
              stock = StockType.OutOfStock;
            } else {
              if (stockLevel !== 0) {
                if (configuration && configuration.lowStockLimit) {
                  if (configuration.lowStockLimit >= stockLevel) {
                    stock = "Low Stock";
                  } else {
                    stock = StockType.InStock;
                  }
                }
              } else {
                stock = StockType.OutOfStock;
              }
            }
          }

          products[i].productInfo = {
            img: products[i].imgList[0],
            name: products[i].name,
            nameMM: products[i].nameMM,
            brandName: products[i].brand?.name,
          };
          products[i].stock = stock;

          products[i].pricing = getPricing(products[i]);
        }
        return res
          .status(200)
          .json(
            products.filter((e: any) =>
              !session || session.role === Role.Buyer
                ? e.isPublished === true
                : true
            )
          );
      case "POST":
        if (session && session.role !== Role.Buyer) {
          if (
            session.role === Role.Staff &&
            !hasPermission(session, ProductPermission.productCreateAllow)
          ) {
            return res.status(401).json(Unauthorized);
          }
          let newData: any = {};
          if (typeof req.body === "object") {
            newData = req.body;
          } else {
            newData = JSON.parse(req.body);
          }
          let product = await createProduct(newData);
          if (isSeller(session)) {
            let adminList = await getAdminIdList();
            let staffList = await getStaffIdList(
              ProductPermission.productNotiAllow
            );

            let msg: any = {
              body: product.name + " was created by " + product.seller.username,
              createdAt: new Date().toISOString(),
              title: "New Product: " + product.name,
              type: NotiType.NewProduct,
              requireInteraction: false,
              sendList: [...adminList, ...staffList],
              details: {
                web: "/products/" + encodeURIComponent(product.slug),
                mobile: {
                  screen: "Products",
                  slug: product.slug,
                },
              },
            };
            await addNotification(msg, "");
          }
          return res.status(200).json(product);
        } else {
          return res.status(401).json(Unauthorized);
        }
      case "PUT":
        if (session && session.role !== Role.Buyer) {
          if (
            session.role === Role.Staff &&
            !hasPermission(session, ProductPermission.productUpdateAllow)
          ) {
            return res.status(401).json(Unauthorized);
          }
          let data: any = {};
          if (typeof req.body === "object") {
            data = req.body;
          } else {
            data = JSON.parse(req.body);
          }
          let { id } = req.query;
          if (data.id) {
            delete data.id;
          }
          if (id) {
            let product: any = await updateProduct(id.toString(), data);
            if (product.isSuccess === true) {
              let adminList = await getAdminIdList();
              let staffList = await getStaffIdList(
                ProductPermission.productNotiAllow
              );

              let msg: any = {
                body: product.data.name + " was updated by " + session.username,
                createdAt: new Date().toISOString(),
                title: "Update Product: " + product.data.name,
                type: NotiType.UpdateProduct,
                requireInteraction: false,
                sendList: [...adminList, ...staffList, product.data.sellerId],
                details: {
                  web: "/products/" + encodeURIComponent(product.data.slug),
                  mobile: {
                    screen: "Products",
                    slug: product.data.slug,
                  },
                },
              };
              await addNotification(msg, "");
              return res.status(200).json(product.data);
            } else {
              return res.status(400).json(product.data);
            }
          } else {
            return res.status(400).json(BadRequest);
          }
        } else {
          return res.status(401).json(Unauthorized);
        }
      case "DELETE":
        let { id: deleteId } = req.query;
        if (session && session.role !== Role.Buyer) {
          if (deleteId) {
            let orders = await prisma.order.findMany({});
            let isExists =
              orders.filter((e) =>
                e.cartItems.find(
                  (z: any) => z.productId === deleteId?.toString()
                )
              ).length > 0;
            if (isExists) {
              return res.status(400).json(Exists);
            } else {
              if (session.role === Role.Staff) {
                if (
                  hasPermission(session, ProductPermission.productDeleteAllow)
                ) {
                  await prisma.productView.deleteMany({
                    where: {
                      productId: deleteId.toString(),
                    },
                  });

                  let prod = await prisma.product.delete({
                    where: { id: deleteId.toString() },
                  });
                  return res.status(200).json(Success);
                } else {
                  return res.status(401).json(Unauthorized);
                }
              } else {
                await prisma.productView.deleteMany({
                  where: {
                    productId: deleteId.toString(),
                  },
                });
                let prod = await prisma.product.delete({
                  where: { id: deleteId.toString() },
                });
                return res.status(200).json(Success);
              }
            }
          } else {
            return res.status(400).json(BadRequest);
          }
        } else {
          return res.status(401).json(Unauthorized);
        }
      default:
        res.status(501).json(Unauthorized);
        break;
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
