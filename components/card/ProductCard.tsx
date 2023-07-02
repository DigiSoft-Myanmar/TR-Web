import React from "react";
import ProductImg from "./ProductImg";
import { fileUrl } from "@/types/const";
import { formatAmount, getText } from "@/util/textHelper";
import { ProductType } from "@prisma/client";
import { getPricing } from "@/util/pricing";
import { useRouter } from "next/router";
import Link from "next/link";
import { RemainingTime } from "@/types/productTypes";
import { convertMsToTime, getValue } from "@/util/formatter";

function ProductCard({ product }: { product: any }) {
  const { locale } = useRouter();

  const pricingInfo = getPricing(product);
  const [remainingTime, setRemainingTime] = React.useState<RemainingTime>();

  React.useEffect(() => {
    if (product && product.type === ProductType.Fixed) {
      const startDate = new Date(product.saleStartDate);
      if (new Date() >= startDate) {
        const intervalId = setInterval(() => {
          if (product.saleEndDate) {
            if (
              new Date(product.saleEndDate!).valueOf() > new Date().valueOf()
            ) {
              let remainingTime =
                new Date(product.saleEndDate!).valueOf() - new Date().valueOf();
              setRemainingTime(convertMsToTime(remainingTime));
            } else {
              setRemainingTime(undefined);
            }
          }
        }, 1000);

        // clear interval on re-render to avoid memory leaks
        return () => clearInterval(intervalId);
      }
    } else {
      const startDate = new Date(pricingInfo.minSaleStartDate);
      if (new Date() >= startDate) {
        const intervalId = setInterval(() => {
          if (pricingInfo.maxSaleEndDate) {
            if (
              new Date(pricingInfo.maxSaleEndDate!).valueOf() >
              new Date().valueOf()
            ) {
              let remainingTime =
                new Date(pricingInfo.maxSaleEndDate!).valueOf() -
                new Date().valueOf();
              setRemainingTime(convertMsToTime(remainingTime));
            } else {
              setRemainingTime(undefined);
            }
          }
        }, 1000);

        // clear interval on re-render to avoid memory leaks
        return () => clearInterval(intervalId);
      }
    }
  }, [product, pricingInfo]);

  return (
    <Link
      className="max-w-[200px] overflow-hidden flex flex-col gap-3 rounded-md cursor-pointer bg-white relative border"
      href={"/marketplace/" + encodeURIComponent(product.slug)}
    >
      {pricingInfo.isPromotion === true && (
        <div className="absolute z-30">
          <span className="bg-primary text-white text-sm p-1 rounded-br-md w-fit">
            {product.type === ProductType.Fixed
              ? formatAmount(pricingInfo.discount, locale)
              : "Up to " +
                formatAmount(pricingInfo.maxSaleDiscount, locale)}{" "}
            % OFF
          </span>
        </div>
      )}
      <div className="overflow-hidden">
        <ProductImg
          imgUrl={fileUrl + product.imgList[0]}
          title={product.name}
          roundedAll={false}
          width={200}
        />
      </div>
      <div className="flex flex-col gap-3 text-primaryText p-3">
        <h3 className="text-primaryText font-semibold line-clamp-2">
          {getText(product.name, product.nameMM, locale)}
        </h3>
        <div className="flex flex-col gap-1">
          <p className="text-sm">
            {product.type === ProductType.Fixed
              ? getPricing(product).isPromotion === true
                ? formatAmount(getPricing(product).salePrice, locale, true)
                : formatAmount(getPricing(product).regularPrice, locale, true)
              : getPricing(product).isPromotion === true &&
                getPricing(product).minSalePrice ===
                  getPricing(product).maxSalePrice
              ? formatAmount(getPricing(product).minSalePrice, locale, true)
              : getPricing(product).isPromotion === true
              ? formatAmount(getPricing(product).minSalePrice, locale, false) +
                " - " +
                formatAmount(getPricing(product).maxSalePrice, locale, true)
              : getPricing(product).minRegPrice ===
                getPricing(product).maxRegPrice
              ? formatAmount(getPricing(product).minRegPrice, locale, true)
              : formatAmount(getPricing(product).minRegPrice, locale, false) +
                " - " +
                formatAmount(getPricing(product).maxRegPrice, locale, true)}
          </p>

          {pricingInfo.isPromotion === true && (
            <p className="flex flex-col text-sm">
              <span className="line-through">
                {product.type === ProductType.Fixed
                  ? formatAmount(pricingInfo.regularPrice, locale, true)
                  : formatAmount(pricingInfo.minRegPrice, locale, true) +
                    " - " +
                    formatAmount(pricingInfo.maxRegPrice, locale, true)}
              </span>
            </p>
          )}
        </div>
        {remainingTime && (
          <>
            <span className="text-xs border-t pt-3 border-t-gray-500">
              Sales Ends in
            </span>
            <div className="grid grid-flow-col gap-5 text-center auto-cols-max place-items-center text-primaryText mb-2">
              {remainingTime?.days > 0 ? (
                <div className="flex flex-col text-gray-600 text-xs items-center">
                  <span className="countdown font-mono text-sm text-primaryText font-bold">
                    <span style={getValue(remainingTime?.days)}></span>
                  </span>
                  days
                </div>
              ) : (
                <></>
              )}
              <div className="flex flex-col text-gray-600 text-xs items-center">
                <span className="countdown font-mono text-sm text-primaryText font-bold">
                  <span style={getValue(remainingTime?.hours)}></span>
                </span>
                hours
              </div>
              <div className="flex flex-col text-gray-600 text-xs items-center">
                <span className="countdown font-mono text-sm text-primaryText font-bold">
                  <span style={getValue(remainingTime?.minutes)}></span>
                </span>
                min
              </div>
              <div className="flex flex-col text-gray-600 text-xs items-center">
                <span className="countdown font-mono text-sm text-primaryText font-bold">
                  <span style={getValue(remainingTime?.seconds)}></span>
                </span>
                sec
              </div>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}

export default ProductCard;
