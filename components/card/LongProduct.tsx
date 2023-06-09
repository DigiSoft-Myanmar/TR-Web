import { useMarketplace } from "@/context/MarketplaceContext";
import { fileUrl } from "@/types/const";
import { convertMsToTime, convertStr } from "@/util/formatter";
import { getPricing } from "@/util/pricing";
import { formatAmount, getText } from "@/util/textHelper";
import { ProductType, Review, Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useRef } from "react";

function LongProduct(product: any) {
  const router = useRouter();
  const { locale } = router;
  const pricingInfo = getPricing(product);
  const { accessKey } = router.query;

  const [remainingTime, setRemainingTime] = React.useState<string | undefined>(
    undefined,
  );
  const { data: session }: any = useSession();

  const { setWishedItems, wishedItems } = useMarketplace();

  const review = Math.ceil(
    product.Review.length > 0
      ? product.Review.map((e: Review) => e.rating).reduce(
          (a: number, b: number) => a + b,
          0,
        ) / product.Review.length
      : 0,
  );

  const shortDescriptionElement = useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (shortDescriptionElement.current) {
      let parser = new DOMParser();
      let shortDescriptionContent = parser.parseFromString(
        getText(product.shortDescription, product.shortDescriptionMM, locale),
        "text/html",
      );
      shortDescriptionElement.current.innerHTML = "";
      shortDescriptionElement.current.appendChild(shortDescriptionContent.body);
    }
  }, [shortDescriptionElement.current]);

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
      className="relative flex w-full cursor-pointer flex-row items-stretch space-x-3 rounded-md border bg-white shadow-md"
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
      <div className="relative">
        <Image
          src={fileUrl + product.imgList[0]}
          width={200}
          height={200}
          alt={product.name}
          quality={100}
          style={{
            objectFit: "cover",
            minHeight: "100%",
            maxWidth: 200,
            borderTopLeftRadius: "0.375rem",
            borderBottomLeftRadius: "0.375rem",
          }}
        />
        {pricingInfo.isPromotion === true && (
          <span className="absolute top-0 left-0 z-10 rounded-tl-md bg-primary px-2 py-1 text-xs font-semibold text-white">
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
      {session && session.role === Role.Buyer && (
        <button
          className="absolute top-5 right-5 hover:text-primary"
          onClick={() => {
            if (Array.isArray(wishedItems)) {
              setWishedItems({
                productIds: [product.id],
              });
            } else {
              let wished = wishedItems?.productIds;
              if (wished?.find((e) => e === product.id)) {
                wished = wishedItems?.productIds.filter(
                  (e) => e !== product.id,
                );
              } else {
                if (wishedItems?.productIds) {
                  wished = [...wishedItems?.productIds, product.id];
                } else {
                  wished = [product.id];
                }
              }
              setWishedItems({
                productIds: wished,
              });
            }
          }}
          type="button"
        >
          {wishedItems?.productIds?.find((e) => e === product.id) ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          )}
        </button>
      )}
      <div className="flex w-full flex-col space-y-3 p-5">
        <span className="text-xs font-semibold text-primary">
          {product.brand.brandName}
        </span>
        <h3 className="text-primaryText font-bold line-clamp-2 ">
          {getText(product.name, product.nameMM, locale)}
        </h3>
        {product.Review.length > 0 ? (
          <div className="flex flex-row items-center space-x-1 text-[#eb9b5c]">
            {Array.from(Array(review).keys()).map((e) => (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
                key={e}
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                  clipRule="evenodd"
                />
              </svg>
            ))}
            {Array.from(Array(5 - review).keys()).map((e) => (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 text-gray-400"
                key={e}
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                  clipRule="evenodd"
                />
              </svg>
            ))}
          </div>
        ) : (
          <p className="text-xs">
            {getText("No review yet", "သုံးသပ်ချက်မရှိသေးပါ", locale)}
          </p>
        )}
        <div className="flex flex-col gap-2">
          {pricingInfo.isPromotion === true ? (
            <div className="flex flex-row flex-wrap items-center gap-2">
              <h4 className="font-semibold text-primary">
                {product.type === ProductType.Fixed
                  ? formatAmount(pricingInfo.saleAmount, locale, true)
                  : pricingInfo.minSalePrice !== pricingInfo.maxSalePrice
                  ? formatAmount(pricingInfo.minSalePrice, locale) +
                    " - " +
                    formatAmount(pricingInfo.maxSalePrice, locale, true)
                  : formatAmount(pricingInfo.maxSalePrice, locale, true)}
              </h4>
              <span className="text-primaryText text-xs font-light line-through">
                {product.type === ProductType.Fixed
                  ? formatAmount(pricingInfo.regularPrice, locale, true)
                  : pricingInfo.minRegPrice !== pricingInfo.maxRegPrice
                  ? formatAmount(pricingInfo.minRegPrice, locale) +
                    " - " +
                    formatAmount(pricingInfo.maxRegPrice, locale, true)
                  : formatAmount(pricingInfo.maxRegPrice, locale, true)}
              </span>
            </div>
          ) : (
            <div className="flex flex-row flex-wrap items-center gap-2">
              <h4 className="font-semibold text-primary">
                {product.type === ProductType.Fixed
                  ? formatAmount(pricingInfo.regularPrice, locale, true)
                  : pricingInfo.minRegPrice !== pricingInfo.maxRegPrice
                  ? formatAmount(pricingInfo.minRegPrice, locale) +
                    " - " +
                    formatAmount(pricingInfo.maxRegPrice, locale, true)
                  : formatAmount(pricingInfo.maxRegPrice, locale, true)}
              </h4>
            </div>
          )}

          {pricingInfo.isPromotion === true && remainingTime && (
            <div className="flex flex-col flex-wrap gap-1">
              <span className="text-sm">
                {getText("Offers ends in", "ကုန်ဆုံးရန်", locale)}
              </span>
              <span className="text-sm font-semibold text-primary">
                {remainingTime}
              </span>
            </div>
          )}
        </div>

        {product.shortDescription && (
          <div
            className="my-3 flex flex-wrap gap-5 border-t pt-3"
            ref={shortDescriptionElement}
          ></div>
        )}
      </div>
    </div>
  );
}

export default LongProduct;
