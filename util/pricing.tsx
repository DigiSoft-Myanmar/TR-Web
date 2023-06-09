import { ProductType } from "@prisma/client";
import _ from "lodash";
import { getSalePrice, isBetween } from "./verify";

export function getPricingSingle(product: any) {
  if (!product.regularPrice) {
    return undefined;
  }
  let pricing: any = {
    regularPrice: product.regularPrice,
    isPromotion: false,
  };
  if (product.isSalePeriod && product.isSalePeriod === true) {
    if (
      isBetween(
        typeof product.saleStartDate === "object"
          ? new Date(product.saleStartDate).toLocaleDateString("en-ca")
          : product.saleStartDate,
        typeof product.saleEndDate === "object"
          ? new Date(product.saleEndDate).toLocaleDateString("en-ca")
          : product.saleEndDate,
      )
    ) {
      if (product.salePrice) {
        pricing = {
          ...pricing,
          startDate: product.saleStartDate,
          endDate: product.saleEndDate,
        };
        if (product.isPercent === true) {
          pricing = {
            ...pricing,
            salePrice: product.salePrice,
            isPercent: true,
            saleAmount: getSalePrice(product.regularPrice, product.salePrice),
          };
        } else {
          pricing = {
            ...pricing,
            salePrice: product.regularPrice - product.salePrice,
            saleAmount: product.salePrice,
          };
        }
        pricing = {
          ...pricing,
          isPromotion: true,
        };
      }
    }
  } else if (product.salePrice) {
    if (product.isPercent === true) {
      pricing = {
        ...pricing,
        salePrice: product.salePrice,
        isPercent: true,
        saleAmount: getSalePrice(product.regularPrice, product.salePrice),
      };
    } else {
      pricing = {
        ...pricing,
        salePrice: product.regularPrice - product.salePrice,
        saleAmount: product.salePrice,
      };
    }
    pricing = {
      ...pricing,
      isPromotion: true,
    };
  }
  return pricing;
}

export function getPricing(product: any) {
  if (product.type === ProductType.Fixed) {
    return getPricingSingle(product);
  } else if (product.type === ProductType.Variable) {
    let pricingInfo = [];
    let isPromotion = false;

    for (let i = 0; i < product.variations.length; i++) {
      let p = getPricingSingle(product.variations[i]);
      if (p) {
        pricingInfo.push(p);
        if (p.isPromotion === true) {
          isPromotion = true;
        }
      }
    }
    let minRegPrice = _.minBy(pricingInfo, "regularPrice");
    let maxRegPrice = _.maxBy(pricingInfo, "regularPrice");
    let minSalePrice = _.minBy(pricingInfo, "saleAmount");
    let maxSalePrice = _.maxBy(pricingInfo, "saleAmount");
    let minSaleStartDate = _.minBy(pricingInfo, "saleStartDate");
    let maxSaleEndDate = _.minBy(pricingInfo, "saleEndDate");

    let d: any = {
      minRegPrice: minRegPrice.regularPrice,
      maxRegPrice: maxRegPrice.regularPrice,
      isPromotion,
    };
    if (minSalePrice) {
      d.minSalePrice = minSalePrice.saleAmount;
      d.maxSalePrice = maxSalePrice.saleAmount;
    }
    if (minSaleStartDate) {
      d.minSaleStartDate = minSaleStartDate.saleStartDate;
      d.maxSaleEndDate = maxSaleEndDate.saleEndDate;
    }

    return d;
  }
}

export function calculateEndingTime(endTime: string) {
  if (
    new Date(endTime.substring(0, endTime.length - 1)).valueOf() >
    new Date().valueOf()
  ) {
    let remainingTime = new Date(endTime!).valueOf() - new Date().valueOf();
    return remainingTime;
  } else {
    return 0;
  }
}
