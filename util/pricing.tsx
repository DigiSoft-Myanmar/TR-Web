import { ProductType } from "@prisma/client";
import _ from "lodash";
import { getSalePrice, isBetween } from "./verify";

export function getPriceDiscount(regularPrice: number, salePrice: number) {
  return parseFloat(
    (((regularPrice - salePrice) / regularPrice) * 100).toFixed(2)
  );
}

export function getPricingSingle(product: any) {
  if (!product.regularPrice) {
    return undefined;
  }
  let pricing: any = {
    regularPrice: product.regularPrice,
    isPromotion: false,
  };
  if (product.isSalePeriod && product.isSalePeriod === true) {
    console.log(
      isBetween(
        typeof product.saleStartDate === "object"
          ? new Date(product.saleStartDate).toLocaleDateString("en-ca", {
              timeZone: "Asia/Yangon",
            })
          : product.saleStartDate,
        typeof product.saleEndDate === "object"
          ? new Date(product.saleEndDate).toLocaleDateString("en-ca", {
              timeZone: "Asia/Yangon",
            })
          : product.saleEndDate
      ),
      "Between"
    );
    if (
      isBetween(
        typeof product.saleStartDate === "object"
          ? new Date(product.saleStartDate).toLocaleDateString("en-ca", {
              timeZone: "Asia/Yangon",
            })
          : product.saleStartDate,
        typeof product.saleEndDate === "object"
          ? new Date(product.saleEndDate).toLocaleDateString("en-ca", {
              timeZone: "Asia/Yangon",
            })
          : product.saleEndDate
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
          discount: parseFloat(
            (
              100 -
              parseFloat(
                (
                  ((pricing.regularPrice - pricing.salePrice) /
                    pricing.regularPrice) *
                  100
                ).toFixed(2)
              )
            ).toFixed(2)
          ),
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
      discount: parseFloat(
        (
          100 -
          parseFloat(
            (
              ((pricing.regularPrice - pricing.salePrice) /
                pricing.regularPrice) *
              100
            ).toFixed(2)
          )
        ).toFixed(2)
      ),
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
    let minSaleDiscount = _.minBy(pricingInfo, "discount");
    let maxSaleDiscount = _.minBy(pricingInfo, "discount");

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
    if (minSaleDiscount) {
      d.minSaleDiscount = minSaleDiscount.discount;
      d.maxSaleDiscount = maxSaleDiscount.discount;
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
