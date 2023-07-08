import { SortByType } from "@/components/presentational/SortSelectBox";
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
import { ProductNavType } from "@/types/productTypes";
import { canAccess } from "@/util/roleHelper";
import { ProductType, Role } from "@prisma/client";
import { cond } from "lodash";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useAuth(req);
  switch (req.method) {
    case "GET": {
      let {
        page: pageQry,
        count,
        categories,
        qry,
        tags,
        type,
        conditions,
        startPrice,
        endPrice,
        brands,
        sort,
      } = req.query;

      let page = pageQry ? parseInt(pageQry.toString()) : 1;
      let offset = 0;
      let pageCount = 9;
      if (count) {
        pageCount = parseInt(count.toString());
      }
      if (page && parseInt(page.toString()) > 1) {
        offset = (parseInt(page.toString()) - 1) * pageCount;
      }
      let filter: any = {
        isPublished: true,
        OR: [
          { type: ProductType.Fixed },
          { type: ProductType.Variable },
          {
            type: ProductType.Auction,
            endTime: {
              gte: new Date(),
            },
          },
        ],
      };
      let c: any = [];
      if (categories) {
        if (typeof categories === "string") {
          if (categories.split(",").length > 0) {
            c = categories.split(",");
          } else {
            c = [categories];
          }
        } else {
          c = categories;
        }
      }
      if (c.length > 0) {
        filter = {
          ...filter,
          categoryIds: {
            hasSome: c,
          },
        };
      }
      if (startPrice && endPrice) {
        filter = {
          ...filter,
          priceIndex: {
            gte: parseFloat(startPrice.toString()),
            lte: parseFloat(endPrice.toString()),
          },
        };
      }
      if (type) {
        if (type === ProductNavType.Promotion) {
          filter = {
            ...filter,
            OR: [
              {
                type: {
                  in: [ProductType.Fixed, ProductType.Variable],
                },
                discountPrice: {
                  gt: 0,
                },
                isSalePeriod: false,
              },
              {
                type: {
                  in: [ProductType.Fixed, ProductType.Variable],
                },
                discountPrice: {
                  gt: 0,
                },
                saleStartDate: {
                  lte: new Date(),
                },
                saleEndDate: {
                  gte: new Date(),
                },
                isSalePeriod: true,
              },
            ],
          };
        } else if (type === ProductNavType.Auction) {
          filter = {
            ...filter,
            type: ProductType.Auction,
            endTime: {
              gte: new Date(),
            },
          };
        } else {
          filter = {
            ...filter,
            type: {
              in: [ProductType.Fixed, ProductType.Variable],
            },
          };
        }
      }
      if (tags) {
        let t = [];
        if (typeof tags === "string") {
          if (tags.split(",").length > 0) {
            t = tags.split(",");
          } else {
            t = [tags];
          }
        } else {
          t = tags;
        }
        filter = {
          ...filter,
          tags: {
            hasSome: t,
          },
        };
      }
      if (conditions) {
        let cd = [];
        if (typeof conditions === "string") {
          if (conditions.split(",").length > 0) {
            cd = conditions.split(",");
          } else {
            cd = [conditions];
          }
        } else {
          cd = conditions;
        }
        filter = {
          ...filter,
          conditionId: {
            in: cd,
          },
        };
      }

      if (brands) {
        let cd = [];
        if (typeof brands === "string") {
          if (brands.split(",").length > 0) {
            cd = brands.split(",");
          } else {
            cd = [brands];
          }
        } else {
          cd = brands;
        }
        filter = {
          ...filter,
          brandId: {
            in: cd,
          },
        };
      }
      if (qry) {
        filter = {
          AND: [
            ...filter,
            {
              OR: [
                {
                  name: {
                    contains: qry.toString(),
                    mode: "insensitive",
                  },
                },
                {
                  nameMM: {
                    contains: qry.toString(),
                    mode: "insensitive",
                  },
                },
                {
                  seller: {
                    username: {
                      contains: qry.toString(),
                      mode: "insensitive",
                    },
                  },
                },
                {
                  seller: {
                    displayName: {
                      contains: qry.toString(),
                      mode: "insensitive",
                    },
                  },
                },
                {
                  Brand: {
                    name: {
                      contains: qry.toString(),
                      mode: "insensitive",
                    },
                  },
                },
                {
                  Brand: {
                    nameMM: {
                      contains: qry.toString(),
                      mode: "insensitive",
                    },
                  },
                },
                {
                  Condition: {
                    name: {
                      contains: qry.toString(),
                      mode: "insensitive",
                    },
                  },
                },
                {
                  Condition: {
                    nameMM: {
                      contains: qry.toString(),
                      mode: "insensitive",
                    },
                  },
                },
                {
                  SKU: {
                    contains: qry.toString(),
                    mode: "insensitive",
                  },
                },
              ],
            },
          ],
        };
      }
      let sortQry: any = {
        seller: {
          currentMembership: {
            topSearchStart: "asc",
          },
        },
      };
      if (sort) {
        if (sort === SortByType.SortByNewest) {
          sortQry = {
            ...sortQry,
            createdAt: "desc",
          };
        } else if (sort === SortByType.SortByOldest) {
          sortQry = {
            ...sortQry,
            createdAt: "asc",
          };
        } else if (sort === SortByType.SortByNameAsc) {
          sortQry = {
            ...sortQry,
            name: "asc",
          };
        } else if (sort === SortByType.SortByNameDesc) {
          sortQry = {
            ...sortQry,
            name: "desc",
          };
        } else if (sort === SortByType.SortByPriceAsc) {
          sortQry = {
            ...sortQry,
            priceIndex: "asc",
          };
        } else if (sort === SortByType.SortByPriceDesc) {
          sortQry = {
            ...sortQry,
            priceIndex: "desc",
          };
        } else if (sort === SortByType.SortByRatingAsc) {
          sortQry = {
            ...sortQry,
            ratingIndex: "asc",
          };
        } else if (sort === SortByType.SortByRatingDesc) {
          sortQry = {
            ...sortQry,
            ratingIndex: "desc",
          };
        }
      }

      const products: any = await prisma.product.findMany({
        include: {
          categories: {
            include: {
              subCategory: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        take: pageCount,
        skip: offset,
        where: filter,
      });

      let totalCount = await prisma.product.count({
        where: filter,
      });

      return res.status(200).json({
        data: products,
        nextPage: totalCount > page * pageCount ? page + 1 : undefined,
        currentPage: page ? parseInt(page.toString()) : 1,
        totalPages: Math.ceil(totalCount / pageCount),
        totalCount: totalCount,
      });
    }
    default:
      return res.status(405).json(NotAvailable);
  }
}
