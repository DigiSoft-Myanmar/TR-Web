import { firebaseAdmin } from "@/lib/firebaseAdmin";
import prisma from "@/prisma/prisma";
import { getPricing } from "@/util/pricing";
import { ProductType, Role } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let products = await prisma.product.findMany({
      where: {
        type: ProductType.Fixed,
      },
    });
    for (let i = 0; i < products.length; i++) {
      let d = { ...products[i] };
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
      if (d.id) {
        delete d.id;
      }

      await prisma.product.update({
        where: {
          id: products[i].id,
        },
        data: d,
      });
    }

    /* let variableProducts = await prisma.product.findMany({
      where: {
        type: ProductType.Variable,
      },
    });
    for (let i = 0; i < variableProducts.length; i++) {
      let d = { ...variableProducts[i] };
      let pricingInfo = getPricing(d);

      if (pricingInfo.isPromotion === true) {
        d.isPromotionAll = true;
        if (pricingInfo.minSaleDiscount && pricingInfo.maxSaleDiscount) {
          d.isPromotionAllPeriod = false;
          d.isPromotionAllStartDate = pricingInfo.minSaleDiscount;
          d.isPromotionAllEndDate = pricingInfo.maxSaleDiscount;
        } else {
          d.isPromotionAllPeriod = true;
        }
      } else {
        d.isPromotionAll = false;
      }
      if (d.id) {
        delete d.id;
      }
      await prisma.product.update({
        where: {
          id: variableProducts[i].id,
        },
        data: d,
      });
    } */

    return res.status(200).json({ prodCount: 0 });
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
