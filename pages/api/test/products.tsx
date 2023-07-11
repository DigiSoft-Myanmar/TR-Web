import prisma from "@/prisma/prisma";
import { ProductType, Role } from "@prisma/client";
import { sortBy } from "lodash";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let data = require("./products.json");
    const categoryData = require("./originalCategories.json");
    const brandData = require("./brands.json");
    const conditionData = require("./conditions.json");
    const attributesData = require("./attributes.json");

    let fixedCount = 0;
    let variableCount = 0;
    let user = await prisma.user.findFirst({
      where: {
        role: Role.Trader,
      },
    });

    for (let i = 0; i < data.length; i++) {
      let categories = categoryData.filter((z) =>
        data[i].categories.includes(z._id)
      );
      let cat = await prisma.category.findMany({
        where: {
          slug: {
            in: categories.map((z) => z.slug),
          },
        },
      });
      let brandJson = brandData.find((z) => z._id === data[i].brandId);

      let brand = await prisma.brand.findFirst({
        where: {
          name: brandJson.name,
        },
      });

      let conditionJson = conditionData.find(
        (z) => z._id === data[i].condition
      );

      let condition = await prisma.condition.findFirst({
        where: {
          name: conditionJson.name,
        },
      });

      if (data[i].type === ProductType.Fixed) {
        await prisma.product.create({
          data: {
            isPublished: data[i].isPublished,
            categoryIds: cat.map((z) => z.id),
            type: ProductType.Fixed,
            tags: data[i].tags,
            sellerId: user.id,
            shippingInformation: data[i].shippingInfo,
            shippingInformationMM: data[i].shippingInfoMM,
            conditionId: condition.id,
            imgList: data[i].imgList,
            name: data[i].name,
            nameMM: data[i].nameMM,
            SKU: data[i].SKU,
            shortDescription: data[i].productInfo,
            shortDescriptionMM: data[i].productInfoMM,
            regularPrice: parseInt(data[i].regularPrice),
            stockType: data[i].stockType,
            description: data[i].description,
            descriptionMM: data[i].descriptionMM,
            isFeatured: data[i].isFeatured,
            slug: data[i].slug,
            brandId: brand.id,
            stockLevel: data[i].stockLevel,
            salePrice: data[i].salePrice,
            additionalInformation: data[i].additionalInfo,
            additionalInformationMM: data[i].additionalInfoMM,
            priceIndex: data[i].regularPrice,
          },
        });
        fixedCount = fixedCount + 1;
      } else {
        let attributes = [];
        let variations = [];
        for (let j = 0; j < data[i].attributes.length; j++) {
          let attr: any = await prisma.attribute.findFirst({
            where: {
              name: data[i].attributes[j].name,
            },
          });
          attr.Term = [];

          for (let k = 0; k < data[i].attributes[j].terms.length; k++) {
            let term = await prisma.term.findFirst({
              where: {
                attributeId: attr.id,
                name: data[i].attributes[j].terms[j].name,
              },
            });
            if (term) {
              attr.Term.push(term);
            } else {
              attr.Term.push({
                attributeId: attr.id,
                name: data[i].attributes[j].terms[j].name,
                nameMM: data[i].attributes[j].terms[j].nameMM,
                value: data[i].attributes[j].terms[j].value,
              });
            }
          }
          attributes.push(attr);
        }
        for (let j = 0; j < data[i].variations.length; j++) {
          let variAttributes = [];
          for (let k = 0; k < data[i].variations[j].attributes.length; k++) {
            let attr = await prisma.attribute.findFirst({
              where: {
                name: data[i].attributes[k].name,
              },
            });
            variAttributes.push({
              attributeId: attr.id,
              name: data[i].variations[j].attributes[k].name,
              nameMM: data[i].variations[j].attributes[k].nameMM,
              value: data[i].variations[j].attributes[k].value,
            });
          }
          variations.push({
            ...data[i].variations[j],
            attributes: variAttributes,
          });
        }

        let priceList = sortBy(
          variations,
          (z: any) => z.regularPrice
        ).reverse()[0];

        await prisma.product.create({
          data: {
            isPublished: data[i].isPublished,
            categoryIds: cat.map((z) => z.id),
            type: ProductType.Variable,
            tags: data[i].tags,
            sellerId: user.id,
            shippingInformation: data[i].shippingInfo,
            shippingInformationMM: data[i].shippingInfoMM,
            conditionId: condition.id,
            imgList: data[i].imgList,
            name: data[i].name,
            nameMM: data[i].nameMM,
            shortDescription: data[i].productInfo,
            shortDescriptionMM: data[i].productInfoMM,
            description: data[i].description,
            descriptionMM: data[i].descriptionMM,
            isFeatured: data[i].isFeatured,
            slug: data[i].slug,
            brandId: brand.id,
            additionalInformation: data[i].additionalInfo,
            additionalInformationMM: data[i].additionalInfoMM,
            attributes: attributes,
            variations: variations,
            priceIndex: priceList.regularPrice,
          },
        });
        variableCount = variableCount + 1;
      }
    }
    return res
      .status(200)
      .json({ fixedCount: fixedCount, variableCount: variableCount });
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
