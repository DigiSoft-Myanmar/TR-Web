import ProductCard from "@/components/card/ProductCard";
import ProductImg from "@/components/card/ProductImg";
import Avatar from "@/components/presentational/Avatar";
import { useMarketplace } from "@/context/MarketplaceContext";
import { fileUrl } from "@/types/const";
import { ProductNavType, RemainingTime } from "@/types/productTypes";
import { convertMsToTime, getValue } from "@/util/formatter";
import { getPricing } from "@/util/pricing";
import { formatAmount, getText } from "@/util/textHelper";
import {
  Brand,
  Category,
  Product,
  ProductType,
  Review,
  StockType,
  User,
} from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useTranslation } from "react-i18next";

function BuyNowHome({
  prodList,
  categories,
  isPromotion,
}: {
  prodList: (Product & {
    Brand: Brand;
    Review: Review[];
    seller: User;
  })[];
  categories: Category[];
  isPromotion?: boolean;
}) {
  const { locale } = useRouter();
  const { t } = useTranslation("common");
  const [current, setCurrent] = React.useState("");
  const pricingInfo = getPricing(prodList[0]);
  const [remainingTime, setRemainingTime] = React.useState<RemainingTime>();
  const router = useRouter();
  const { addCart } = useMarketplace();
  let highlightProd: any = prodList[0];

  React.useEffect(() => {
    if (highlightProd && highlightProd.type === ProductType.Fixed) {
      const startDate = new Date(highlightProd.saleStartDate);
      if (new Date() >= startDate) {
        const intervalId = setInterval(() => {
          if (highlightProd.saleEndDate) {
            if (
              new Date(highlightProd.saleEndDate!).valueOf() >
              new Date().valueOf()
            ) {
              let remainingTime =
                new Date(highlightProd.saleEndDate!).valueOf() -
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
  }, [highlightProd, pricingInfo]);

  return (
    <div className="bg-darkShade text-white p-5 lg:p-0 mt-32 lg:mt-56">
      <div className="py-5 flex flex-col gap-5 w-full max-w-screen-xl mx-auto">
        <div className="relative flex flex-col lg:flex-row items-center gap-3">
          <div className="absolute -top-32 lg:-top-56 flex flex-col items-start bg-white rounded-md max-w-[250px]">
            <div className="overflow-hidden">
              <ProductImg
                imgUrl={fileUrl + highlightProd.imgList[0]}
                roundedAll={true}
                title={highlightProd.name}
                width={250}
              />
            </div>
            <div className="flex flex-col gap-3 p-5">
              <h3 className="text-primaryText font-semibold line-clamp-2">
                {getText(highlightProd.name, highlightProd.nameMM, locale)}
              </h3>
              <div className="flex flex-row items-center gap-3 text-gray-600">
                <Avatar
                  username={highlightProd.seller.username}
                  profile={highlightProd.seller.profile}
                />
                <p className="text-sm line-clamp-1">
                  {highlightProd.seller.displayName
                    ? highlightProd.seller.displayName
                    : highlightProd.seller.username}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-[250px] lg:ml-[250px] lg:mt-0 px-5 w-full">
            <div
              className="text-sm"
              dangerouslySetInnerHTML={{
                __html: getText(
                  highlightProd.shortDescription,
                  highlightProd.shortDescriptionMM,
                  locale
                ),
              }}
            />
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 w-full mt-5">
              <div className="flex flex-col gap-3 items-center flex-1">
                <div className="flex flex-row items-center gap-3">
                  <h3 className="font-medium text-gray-200">{t("price")}</h3>
                  {pricingInfo.isPromotion === true ? (
                    <span className="bg-primary text-white rounded-md px-2 py-1 text-sm font-semibold">
                      {highlightProd.type === ProductType.Variable &&
                      pricingInfo.maxSaleDiscount !==
                        pricingInfo.minSaleDiscount
                        ? "Up to " + pricingInfo.maxSaleDiscount
                        : highlightProd.type === ProductType.Variable
                        ? pricingInfo.maxSaleDiscount
                        : pricingInfo.discount}
                      % OFF
                    </span>
                  ) : (
                    <></>
                  )}
                </div>
                <p className="text-xl font-bold">
                  {pricingInfo.isPromotion &&
                  highlightProd.type === ProductType.Fixed
                    ? formatAmount(pricingInfo.saleAmount, locale, true)
                    : pricingInfo.isPromotion === true &&
                      pricingInfo.minSalePrice !== pricingInfo.maxSalePrice
                    ? formatAmount(pricingInfo.minSalePrice, locale, false) +
                      " - " +
                      formatAmount(pricingInfo.maxSalePrice, locale, true)
                    : pricingInfo.isPromotion === true
                    ? formatAmount(pricingInfo.minSalePrice, locale, true)
                    : highlightProd.type === ProductType.Fixed
                    ? formatAmount(pricingInfo.regularPrice, locale, true)
                    : pricingInfo.minRegPrice !== pricingInfo.maxRegPrice
                    ? formatAmount(pricingInfo.minRegPrice, locale, false) +
                      " - " +
                      formatAmount(pricingInfo.maxRegPrice, locale, true)
                    : formatAmount(pricingInfo.regularPrice, locale, true)}
                </p>

                {remainingTime && (
                  <div className="grid grid-flow-col gap-5 text-center auto-cols-max place-items-center text-white">
                    {remainingTime?.days > 0 ? (
                      <div className="flex flex-col text-gray-200 text-xs items-center">
                        <span className="countdown font-mono text-lg text-white font-bold">
                          <span style={getValue(remainingTime?.days)}></span>
                        </span>
                        days
                      </div>
                    ) : (
                      <></>
                    )}
                    <div className="flex flex-col text-gray-200 text-xs items-center">
                      <span className="countdown font-mono text-lg text-white font-bold">
                        <span style={getValue(remainingTime?.hours)}></span>
                      </span>
                      hours
                    </div>
                    <div className="flex flex-col text-gray-200 text-xs items-center">
                      <span className="countdown font-mono text-lg text-white font-bold">
                        <span style={getValue(remainingTime?.minutes)}></span>
                      </span>
                      min
                    </div>
                    <div className="flex flex-col text-gray-200 text-xs items-center">
                      <span className="countdown font-mono text-lg text-white font-bold">
                        <span style={getValue(remainingTime?.seconds)}></span>
                      </span>
                      sec
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3 items-center flex-1">
                <h3 className="font-medium text-gray-200">
                  {t("stockAvailability")}
                </h3>
                {highlightProd.type === ProductType.Fixed ? (
                  <p
                    className={`${
                      highlightProd.stockType === StockType.InStock
                        ? "bg-success"
                        : highlightProd.stockType === StockType.OutOfStock
                        ? "bg-error"
                        : highlightProd.stockType === StockType.StockLevel
                        ? "bg-warning"
                        : "bg-success"
                    } p-2 rounded-md text-sm font-semibold`}
                  >
                    {highlightProd.stockType === StockType.InStock
                      ? t("inStock")
                      : highlightProd.stockType === StockType.OutOfStock ||
                        (highlightProd.stockType === StockType.StockLevel &&
                          highlightProd.stockLevel <= 0)
                      ? t("outOfStock")
                      : highlightProd.stockType === StockType.StockLevel
                      ? t("quantity").replace(
                          "{data}",
                          formatAmount(highlightProd.stockLevel, locale)
                        )
                      : t("inStock")}
                  </p>
                ) : (
                  <p
                    className={`${
                      highlightProd.variations.filter(
                        (z: any) => z.stockType === StockType.InStock
                      ).length > 0
                        ? "bg-success"
                        : highlightProd.variations.filter(
                            (z: any) => z.stockType === StockType.StockLevel
                          ).length > 0
                        ? "bg-warning"
                        : highlightProd.variations.filter(
                            (z: any) => z.stockType === StockType.OutOfStock
                          ).length > 0
                        ? "bg-error"
                        : "bg-success"
                    } p-2 rounded-md text-sm font-semibold`}
                  >
                    {highlightProd.variations.filter(
                      (z: any) => z.stockType === StockType.InStock
                    ).length > 0
                      ? t("inStock")
                      : highlightProd.variations.filter(
                          (z: any) => z.stockType === StockType.StockLevel
                        ).length > 0
                      ? t("quantity").replace(
                          "{data}",
                          formatAmount(
                            highlightProd.variations.find(
                              (z: any) => z.stockType === StockType.StockLevel
                            )?.stockLevel,
                            locale
                          )
                        )
                      : highlightProd.stockType === StockType.StockLevel
                      ? t("outOfStock")
                      : t("inStock")}
                  </p>
                )}
              </div>
              <div className="flex flex-row items-center gap-3 flex-1 justify-end mt-3 lg:mt-5">
                <button
                  type="button"
                  className="bg-primary text-white rounded-md px-3 py-3 flex-1 text-sm hover:bg-primary-focus transition"
                  onClick={() => {
                    if (highlightProd.type === ProductType.Fixed) {
                      addCart(
                        highlightProd.sellerId,
                        pricingInfo.normalPrice,
                        pricingInfo.salePrice,
                        highlightProd.id,
                        1,
                        highlightProd.stockType,
                        highlightProd.stockLevel,
                        undefined,
                        highlightProd.seller
                      );
                    } else {
                      router.push(
                        "/marketplace/" + encodeURIComponent(highlightProd.slug)
                      );
                    }
                  }}
                >
                  {t("buyNow")}
                </button>
                <Link
                  className="bg-slate-600 text-white rounded-md px-3 py-3 flex-1 text-sm hover:bg-slate-700 transition text-center"
                  href={
                    "/marketplace/" + encodeURIComponent(highlightProd.slug)
                  }
                >
                  {t("seeDetails")}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 lg:mt-20 flex flex-row items-center justify-between gap-5 w-full">
          <h3 className="font-semibold text-lg">
            {isPromotion === true
              ? getText(
                  "Promotion Products",
                  "အထူးလျော့စျေးပစ္စည်းများ",
                  locale
                )
              : getText("Highlight Products", "အသားပေးပစ္စည်းများ", locale)}
          </h3>
          <Link
            href={
              isPromotion === true
                ? "/marketplace?type=" + ProductNavType.Promotion
                : "/marketplace?type=" + ProductNavType.Buy
            }
            className="text-sm font-semibold transition group pb-[3px] hover:pb-0"
          >
            {t("seeMore")}
            <div className="group-hover:flex hidden w-1/2 h-[2px] rounded-full bg-white mt-1"></div>
          </Link>
        </div>
        <div className="flex flex-row items-center gap-5 max-w-screen-xl overflow-x-auto scrollbar-hide">
          <div
            className={`cursor-pointer text-sm whitespace-nowrap group ${
              current === "" ? "pb-0" : "pb-3 hover:pb-0"
            }`}
            onClick={() => {
              setCurrent("");
            }}
          >
            {t("all")}
            {current === "" ? (
              <div className="w-1/2 h-1 rounded-full bg-white mt-2"></div>
            ) : (
              <div className="group-hover:flex hidden w-1/2 h-1 rounded-full bg-white mt-2"></div>
            )}
          </div>
          {categories?.map((z: any, index: number) => (
            <div
              key={index}
              className={`cursor-pointer text-sm whitespace-nowrap group ${
                current === z.id ? "pb-0" : "pb-3 hover:pb-0"
              }`}
              onClick={() => {
                setCurrent(z.id);
              }}
            >
              {getText(z.name, z.nameMM, locale)}

              {current === z.id ? (
                <div className="w-1/2 h-1 rounded-full bg-white mt-2"></div>
              ) : (
                <div className="group-hover:flex hidden w-1/2 h-1 rounded-full bg-white mt-2"></div>
              )}
            </div>
          ))}
        </div>
        {prodList.filter((z) =>
          current === ""
            ? z.id !== highlightProd.id
            : z.id !== highlightProd.id &&
              z.categoryIds.find((b) => b === current)
        ).length > 0 ? (
          <div className="mt-3 flex flex-row max-w-screen-xl overflow-auto scrollbar-hide pb-5 gap-3">
            {prodList
              .filter((z) =>
                current === ""
                  ? z.id !== highlightProd.id
                  : z.id !== highlightProd.id &&
                    z.categoryIds.find((b) => b === current)
              )
              .map((z, index) => (
                <ProductCard key={index} product={z} />
              ))}
          </div>
        ) : (
          <div className="grid h-[300px] px-4 place-content-center">
            <h1 className="tracking-widest text-white uppercase">
              {current === ""
                ? t("browsedAllProducts")
                : getText(
                    "No products related to " +
                      categories?.find((b) => b.id === current).name,
                    +categories?.find((b) => b.id === current).nameMM +
                      " နှင့်ပတ်သက်၍ ပစ္စည်းမရှိပါ။",
                    locale
                  )}
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyNowHome;
