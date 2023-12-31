import clientPromise from "@/lib/mongodb";
import {
  BadAuction,
  BadAuctionPrice,
  BadSKU,
  Exists,
  NotAvailable,
} from "@/types/ApiResponseTypes";
import {
  Attribute,
  Category,
  Product,
  ProductType,
  Role,
  Term,
} from "@prisma/client";
import { ObjectId } from "mongodb";
import prisma from "../prisma";
import { sortBy } from "lodash";
import { getPricing } from "@/util/pricing";

export const getAllCategories = async () => {
  let categories: any = await prisma.category.findMany({});
  let catData: any = [];
  for (let i = 0; i < categories.length; i++) {
    let prodCount = await prisma.product.count({
      where: { categoryIds: { has: categories[i].id } },
    });
    categories[i].prodCount = prodCount;

    if (!categories[i].parentId) {
      catData.push(categories[i]);
    } else {
      let parentCategory: any = catData.find(
        (e: any) => e.id === categories[i].parentId
      );
      if (parentCategory) {
        if (parentCategory.subCategory) {
          parentCategory.subCategory = [
            ...parentCategory.subCategory,
            categories[i],
          ];
        } else {
          parentCategory.subCategory = [categories[i]];
        }
      }
    }
  }
  for (let i = 0; i < catData.length; i++) {
    if (catData[i].subCategory) {
      for (let j = 0; j < catData[i].subCategory.length; j++) {
        let childCat: any = categories.filter(
          (e: any) => e.parentId === catData[i].subCategory[j].id
        );
        catData[i].subCategory[j].subCategory = childCat;
      }
    }
  }

  return catData;
};

export const getAllProducts = async (
  id: string,
  session: any,
  type: string
) => {
  if (id) {
    let filter: any = {
      sellerId: id,
    };
    if (type) {
      filter = {
        ...filter,
        type: type,
      };
    } else {
      filter = {
        ...filter,
        type: {
          not: ProductType.Auction,
        },
      };
    }
    const products = await prisma.product.findMany({
      include: {
        Review: true,
        Brand: true,
        Condition: true,
        seller: true,
        categories: {
          include: {
            subCategory: true,
          },
        },
      },
      where: filter,
      orderBy: {
        createdAt: "desc",
      },
    });
    return products;
  } else {
    let filter = {};
    if (session && session.role !== Role.Buyer) {
      filter = {};
    } else {
      filter = {
        seller: {
          sellAllow: true,
          isBlocked: false,
          isDeleted: false,
        },
      };
    }
    if (type) {
      filter = {
        ...filter,
        type: type,
      };
    } else {
      filter = {
        ...filter,
        type: {
          not: ProductType.Auction,
        },
      };
    }
    const products = await prisma.product.findMany({
      include: {
        Review: true,
        Brand: true,
        Condition: true,
        seller: true,
        categories: {
          include: {
            subCategory: true,
          },
        },
      },
      where: filter,
      orderBy: {
        createdAt: "desc",
      },
    });

    return products;
  }
};

export const getFeaturedProducts = async () => {
  const products = await prisma.product.findMany({
    where: {
      isPublished: true,
      isFeatured: true,
      seller: {
        isBlocked: false,
        isDeleted: false,
        sellAllow: true,
      },
    },
    include: {
      Brand: true,
      Condition: true,
      seller: true,
      Review: true,
      UnitSold: true,
    },
  });
  return products;
};

export const getProductsBySeller = async (id: string) => {
  const products = await prisma.product.findMany({
    where: {
      sellerId: id,
    },
    include: {
      Brand: true,
      Condition: true,
      seller: true,
      Review: true,
      UnitSold: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return products;
};

export const createProduct = async (data: Product) => {
  let d: any = { ...data };
  let user = await prisma.user.findFirst({
    where: {
      id: data.sellerId,
    },
  });

  if (d.categories) {
    delete d.categories;
  }
  if (d.slug) {
  } else if (d.SKU) {
    if (d.seller) {
      d.slug = d.seller.username + "-" + d.SKU;
    } else if (user) {
      d.slug = user.username + "-" + d.SKU;
    }
  } else {
    let slug = "";
    if (d.seller) {
      slug = d.seller.username;
    } else if (user) {
      slug = user.username;
    }
    if (slug && d.variations && d.variations.length > 0) {
      slug = slug + "#" + d.variations[0].SKU;
    }
    let count = await prisma.product.count({
      where: {
        slug: slug,
      },
    });
    if (count > 0) {
      slug = slug + "_" + Date.now();
    }
  }
  let prodCount = await prisma.product.count({
    where: {
      slug: d.slug,
    },
  });
  if (prodCount > 0) {
    d.slug = d.slug + "_" + (prodCount + 1);
  }

  if (d.brandId) {
    delete d.Brand;
  } else {
    let brand = await prisma.brand.create({
      data: d.Brand,
    });
    d.brandId = brand.id;
    delete d.Brand;
  }
  if (d.Condition) {
    delete d.Condition;
  }
  if (d.seller) {
    delete d.seller;
  }
  if (d.type === ProductType.Fixed) {
    let pricingInfo = getPricing(d);
    if (pricingInfo.isPromotion === true) {
      d.isPromotionAll = true;
      if (pricingInfo.startDate && pricingInfo.endDate) {
        d.isPromotionAllPeriod = false;
        d.isPromotionAllStartDate = pricingInfo.startDate;
        d.isPromotionAllEndDate = pricingInfo.endDate;
      } else {
        d.isPromotionAllPeriod = true;
      }
    } else {
      d.isPromotionAll = false;
    }
    d.priceIndex = d.regularPrice;
  } else if (d.type === ProductType.Variable) {
    let priceList = sortBy(
      d.variations,
      (z: any) => z.regularPrice
    ).reverse()[0];
    d.priceIndex = priceList.regularPrice;
    let pricingInfo = getPricing(d);

    if (pricingInfo.isPromotion === true) {
      d.isPromotionAll = true;
      if (pricingInfo.minSaleStartDate && pricingInfo.maxSaleEndDate) {
        d.isPromotionAllPeriod = false;
        d.isPromotionAllStartDate = pricingInfo.minSaleStartDate;
        d.isPromotionAllEndDate = pricingInfo.maxSaleEndDate;
      } else {
        d.isPromotionAllPeriod = true;
      }
    } else {
      d.isPromotionAll = false;
    }
  } else if (d.type === ProductType.Auction) {
    d.priceIndex = d.openingBid;
  }

  const product = await prisma.product.create({
    data: d,
    include: {
      seller: true,
    },
  });
  return product;
};

export const updateProduct = async (id: string, data: Product) => {
  let d: any = { ...data };
  let user = await prisma.user.findFirst({
    where: {
      id: data.sellerId,
    },
  });
  if (d.categories) {
    delete d.categories;
  }
  if (d.slug) {
  } else if (d.SKU) {
    if (d.seller) {
      d.slug = d.seller.username + "-" + d.SKU;
    } else if (user) {
      d.slug = user.username + "-" + d.SKU;
    }
  } else {
    let slug = "";

    if (d.seller) {
      slug = d.seller.username;
    } else if (user) {
      slug = user.username + "-" + d.SKU;
    }

    if (slug && d.variations && d.variations.length > 0) {
      slug = slug + "#" + d.variations[0].SKU;
    }
    let count = await prisma.product.count({
      where: {
        slug: slug,
      },
    });
    if (count > 0) {
      slug = slug + "_" + Date.now();
    }
  }
  let prodCount = await prisma.product.count({
    where: {
      slug: d.slug,
      id: {
        not: id,
      },
    },
  });
  if (prodCount > 0) {
    d.slug = d.slug + "_" + (prodCount + 1);
  }
  if (d.brandId) {
    delete d.Brand;
  } else {
    let brand = await prisma.brand.create({
      data: {
        name: d.Brand.name,
      },
    });
    d.brandId = brand.id;
    delete d.Brand;
  }
  if (d.Condition) {
    delete d.Condition;
  }
  if (d.seller) {
    delete d.seller;
  }
  if (d.Auctions) {
    delete d.Auctions;
  }

  if (d.type === ProductType.Variable) {
    if (d.saleStartDate) {
      delete d.saleStartDate;
    }
    if (d.saleEndDate) {
      delete d.saleEndDate;
    }
  }
  if (d.type === ProductType.Fixed) {
    d.priceIndex = d.regularPrice;
    let pricingInfo = getPricing(d);
    if (pricingInfo.isPromotion === true) {
      d.isPromotionAll = true;
      if (pricingInfo.startDate && pricingInfo.endDate) {
        d.isPromotionAllPeriod = false;
        d.isPromotionAllStartDate = pricingInfo.startDate;
        d.isPromotionAllEndDate = pricingInfo.endDate;
      } else {
        d.isPromotionAllPeriod = true;
      }
    } else {
      d.isPromotionAll = false;
    }
  } else if (d.type === ProductType.Variable) {
    let priceList = sortBy(
      d.variations,
      (z: any) => z.regularPrice
    ).reverse()[0];
    d.priceIndex = priceList.regularPrice;
    let pricingInfo = getPricing(d);

    if (pricingInfo.isPromotion === true) {
      d.isPromotionAll = true;
      if (pricingInfo.minSaleStartDate && pricingInfo.maxSaleEndDate) {
        d.isPromotionAllPeriod = false;
        d.isPromotionAllStartDate = pricingInfo.minSaleStartDate;
        d.isPromotionAllEndDate = pricingInfo.maxSaleEndDate;
      } else {
        d.isPromotionAllPeriod = true;
      }
    } else {
      d.isPromotionAll = false;
    }
  } else if (d.type === ProductType.Auction) {
    d.priceIndex = d.openingBid;
  }

  if (d.type === ProductType.Auction) {
    let product = await prisma.product.findFirst({
      where: {
        id: id,
        isPublished: true,
        SKU: d.SKU,
      },
      include: {
        WonList: {
          include: {
            auction: true,
          },
        },
        Auctions: true,
      },
    });
    if (product) {
      if (
        new Date(product.startTime).getTime() <= new Date().getTime() &&
        new Date(product.endTime).getTime() > new Date().getTime()
      ) {
        return { isSuccess: false, data: BadAuction };
      } else if (product.WonList.length > 0) {
        if (
          product.WonList.filter(
            (z) =>
              z.auction.SKU === d.SKU &&
              (z.status === "InCart" || z.status === "Purchased")
          )
        ) {
          return { isSuccess: false, data: BadSKU };
        }
      } else if (product.Auctions.length > 0) {
        let list = product.Auctions.filter((a) => a.SKU === d.SKU);
        let amount = sortBy(list, (z) => z.amount).reverse();
        if (amount.length > 0 && amount[0].amount >= product.estimatedPrice) {
          return { isSuccess: false, data: BadAuctionPrice };
        }
      }
    } else if (d.type !== ProductType.Auction) {
      return { isSuccess: false, data: NotAvailable };
    }
    const updateProd = await prisma.product.update({
      where: { id: id },
      data: d,
    });
    return { isSuccess: true, data: updateProd };
  } else {
    if (d.salePrice) {
      const product = await prisma.product.update({
        where: { id: id },
        data: d,
      });
      return { isSuccess: true, data: product };
    } else {
      const product = await prisma.product.update({
        where: { id: id },
        data: {
          ...d,
          salePrice: {
            unset: true,
          },
          isSalePeriod: false,
          saleStartDate: {
            unset: true,
          },
          saleEndDate: {
            unset: true,
          },
        },
      });
      return { isSuccess: true, data: product };
    }
  }
};

export const getOriginalCategories = async () => {
  const categories = await prisma.category.findMany({});
  return categories;
};
export const getAllAttributes = async () => {
  let attributes: any = await prisma.attribute.findMany({
    include: {
      Term: true,
    },
  });
  for (let i = 0; i < attributes.length; i++) {
    let prod = await prisma.product.findMany({
      where: {
        attributes: {
          isEmpty: false,
        },
      },
    });
    let prodCount = prod.filter((e) =>
      e.attributes.find((a: any) => a.id === attributes[i].id)
    ).length;

    attributes[i].prodCount = prodCount;
    if (attributes[i].Term) {
      for (let j = 0; j < attributes[i].Term.length; j++) {
        let prod1 = await prisma.product.findMany({
          where: {
            attributes: {
              isEmpty: false,
            },
          },
        });

        let prodCount = prod1.filter((e) =>
          e.attributes.find(
            (a: any) =>
              a.Term &&
              a.Term.find((z: any) => z.id === attributes[i].Term[j].id)
          )
        ).length;

        attributes[i].Term[j].prodCount = prodCount;
      }
    }
  }

  return attributes;
};

export const createCategory = async (data: Category) => {
  const category = await prisma.category.create({ data: data });
  return category;
};

export const updateCategory = async (id: string, data: Category) => {
  let category = await prisma.category.update({
    where: { id: id },
    data: data,
  });
  return category;
};

export const deleteCategory = async (id: string) => {
  let prodCount = await prisma.product.count({
    where: {
      categoryIds: {
        has: id,
      },
    },
  });
  if (prodCount > 0) {
    return { isError: true, data: Exists };
  } else {
    let data = await prisma.category.delete({
      where: {
        id: id,
      },
    });
    return { isError: false, data: data };
  }
};

export const deleteAttribute = async (id: string) => {
  let prod = await prisma.product.findMany({
    where: {
      attributes: {
        isEmpty: false,
      },
    },
  });
  let prodCount = prod.filter((e) =>
    e.attributes.find((a: any) => a.id === id)
  ).length;

  if (prodCount > 0) {
    return { isError: true, data: Exists };
  } else {
    let data = await prisma.attribute.delete({
      where: {
        id: id,
      },
    });
    return { isError: false, data: data };
  }
};

export const createAttribute = async (data: Attribute) => {
  const attribute = await prisma.attribute.create({ data: data });
  return attribute;
};

export const updateAttribute = async (id: string, data: Attribute) => {
  const attribute = await prisma.attribute.update({
    where: { id: id },
    data: data,
  });
  return attribute;
};

export const createTerm = async (data: Term) => {
  const attribute = await prisma.term.create({ data: data });
  return attribute;
};

export const updateTerm = async (id: string, data: Term) => {
  const attribute = await prisma.term.update({
    where: { id: id },
    data: data,
  });
  return attribute;
};

export const deleteTerm = async (id: string) => {
  let prod = await prisma.product.findMany({
    where: {
      attributes: {
        isEmpty: false,
      },
    },
  });
  let prodCount = prod.filter((e) =>
    e.attributes.find(
      (a: any) => a.Term && a.Term.find((t: any) => t.id === id)
    )
  ).length;
  if (prodCount > 0) {
    return { isError: true, data: Exists };
  } else {
    let data = await prisma.term.delete({
      where: {
        id: id,
      },
    });
    return { isError: false, data: data };
  }
};
