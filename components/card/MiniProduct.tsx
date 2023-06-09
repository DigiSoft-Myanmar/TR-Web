import { fileUrl } from "@/types/const";
import { RemainingTime } from "@/types/productTypes";
import { convertMsToTime, convertStr } from "@/util/formatter";
import { getPricing } from "@/util/pricing";
import { formatAmount, getText } from "@/util/textHelper";
import { Product, ProductType } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";

function MiniProduct({ product }: { product: any }) {
  const router = useRouter();
  const pricingInfo = getPricing(product);
  const { accessKey } = router.query;
  const [remainingTime, setRemainingTime] = React.useState<string | undefined>(
    undefined,
  );
  const { locale } = router;

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
              setRemainingTime(
                convertStr(convertMsToTime(remainingTime), locale),
              );
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
              setRemainingTime(
                convertStr(convertMsToTime(remainingTime), locale),
              );
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
    <div
      className="group relative flex min-w-[150px] max-w-[150px] flex-1 cursor-pointer flex-col items-center space-y-1 rounded-md bg-white p-2 transition duration-100"
      onClick={() => {
        router.push(
          accessKey
            ? "/marketplace/" +
                encodeURIComponent(product.slug) +
                "?accessKey=" +
                accessKey
            : "/marketplace/" + encodeURIComponent(product.slug),
        );
      }}
    >
      <div className="relative max-h-[100px] min-h-[100px] min-w-[100px] max-w-[100px] overflow-hidden">
        <Image
          src={fileUrl + product.imgList[0]}
          width={100}
          height={100}
          alt={product.name!}
          quality={100}
          className="max-h-[100px] min-h-[100px] min-w-[100px] max-w-[100px] object-cover group-hover:scale-110"
        />
        {pricingInfo.isPromotion === true && (
          <span className="absolute top-0 left-0 z-10 bg-primary px-1 py-0.5 text-[10px] font-semibold text-white">
            {product.type === ProductType.Variable
              ? 100 -
                Math.ceil(
                  (pricingInfo.maxSalePrice * 100) / pricingInfo.maxRegPrice,
                ) +
                getText("% OFF", "% လျော့စျေး", locale)
              : 100 -
                Math.ceil(
                  (pricingInfo.saleAmount * 100) / pricingInfo.regularPrice,
                ) +
                getText("% OFF", "% လျော့စျေး", locale)}
          </span>
        )}
      </div>
      <div className="flex flex-grow flex-col items-center space-y-1 py-1">
        {pricingInfo.isPromotion === true ? (
          <div className="flex flex-row flex-wrap items-center justify-center text-center">
            <h4 className="text-sm font-semibold text-primary">
              {product.type === ProductType.Fixed
                ? formatAmount(pricingInfo.saleAmount, router.locale, true)
                : pricingInfo.minSalePrice !== pricingInfo.maxSalePrice
                ? formatAmount(pricingInfo.minSalePrice, locale) +
                  " - " +
                  formatAmount(pricingInfo.maxSalePrice, locale, true)
                : formatAmount(pricingInfo.maxSalePrice, locale, true)}
            </h4>
          </div>
        ) : (
          <div className="flex flex-row flex-wrap items-center justify-center text-center">
            <h4 className="text-sm font-semibold text-primary">
              {product.type === ProductType.Fixed
                ? formatAmount(pricingInfo.regularPrice, router.locale, true)
                : pricingInfo.minRegPrice !== pricingInfo.maxRegPrice
                ? formatAmount(pricingInfo.minRegPrice, locale) +
                  " - " +
                  formatAmount(pricingInfo.maxRegPrice, locale, true)
                : formatAmount(pricingInfo.maxRegPrice, locale, true)}
            </h4>
          </div>
        )}
        {pricingInfo.isPromotion === true && remainingTime && (
          <>
            <span className="text-center text-xs">
              {getText("Offers ends in", "ကုန်ဆုံးရန်", locale)}
            </span>
            <span className="text-center text-xs font-semibold text-primary">
              {remainingTime}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default MiniProduct;
