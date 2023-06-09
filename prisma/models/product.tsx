import clientPromise from "@/lib/mongodb";
import { Exists } from "@/types/ApiResponseTypes";
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

export const getAllProducts = async (id: string, session: any) => {
  if (id) {
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
      where: {
        brandId: id,
      },
    });
    return products;
  } else {
    let filter = {};
    if (session && session.role !== Role.Buyer) {
      filter = {};
    } else {
      filter = {
        brand: {
          user: {
            sellAllow: true,
          },
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
    },
  });
  return products;
};

export const getProductsByBrand = async (id: string) => {
  const products = await prisma.product.findMany({
    where: {
      brandId: id,
    },
    include: {
      Brand: true,
      Condition: true,
      seller: true,
      Review: true,
    },
  });
  return products;
};

export const createProduct = async (data: Product) => {
  let d: any = { ...data };

  if (d.categories) {
    delete d.categories;
  }
  if (d.slug) {
  } else {
    d.slug = d.brand.brandName + "-" + d.SKU;
  }
  let prodCount = await prisma.product.count({
    where: {
      slug: d.slug,
    },
  });
  if (prodCount > 0) {
    d.slug = d.slug + "_" + (prodCount + 1);
  }

  if (d.brand) {
    delete d.brand;
  }

  const product = await prisma.product.create({
    data: d,
  });
  return product;
};

export const updateProduct = async (id: string, data: Product) => {
  let d: any = { ...data };
  console.log(data);
  if (d.categories) {
    delete d.categories;
  }
  if (d.slug) {
  } else {
    d.slug = d.brand.brandName + "-" + d.SKU;
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
  if (d.brand) {
    delete d.brand;
  }
  if (d.type === ProductType.Variable) {
    if (d.saleStartDate) {
      delete d.saleStartDate;
    }
    if (d.saleEndDate) {
      delete d.saleEndDate;
    }
  }

  const product = await prisma.product.update({
    where: { id: id },
    data: d,
  });
  return product;
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
