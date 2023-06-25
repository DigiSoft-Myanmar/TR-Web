import ProductImg from "@/components/card/ProductImg";
import Avatar from "@/components/presentational/Avatar";
import { fileUrl } from "@/types/const";
import { RemainingTime } from "@/types/productTypes";
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
}: {
  prodList: (Product & {
    Brand: Brand;
    Review: Review[];
    seller: User;
  })[];
  categories: Category[];
}) {
  const { locale } = useRouter();
  const { t } = useTranslation("common");
  const [current, setCurrent] = React.useState("");
  const pricingInfo = getPricing(prodList[0]);
  const [remainingTime, setRemainingTime] = React.useState<RemainingTime>();

  React.useEffect(() => {
    if (prodList[0] && prodList[0].type === ProductType.Fixed) {
      const startDate = new Date(prodList[0].saleStartDate);
      if (new Date() >= startDate) {
        const intervalId = setInterval(() => {
          if (prodList[0].saleEndDate) {
            if (
              new Date(prodList[0].saleEndDate!).valueOf() >
              new Date().valueOf()
            ) {
              let remainingTime =
                new Date(prodList[0].saleEndDate!).valueOf() -
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
  }, [prodList[0], pricingInfo]);

  return (
    <div className="bg-darkShade text-white p-5 lg:p-0">
      <div className="py-5 flex flex-col gap-5 w-full max-w-screen-xl mx-auto">
        <div className="relative flex flex-col lg:flex-row items-center gap-3">
          <div className="absolute -top-32 lg:-top-56 flex flex-col items-start bg-white rounded-md max-w-[250px]">
            <div className="overflow-hidden">
              <ProductImg
                imgUrl={fileUrl + prodList[0].imgList[0]}
                roundedAll={true}
                title={prodList[0].name}
                width={250}
              />
            </div>
            <div className="flex flex-col gap-3 p-5">
              <h3 className="text-primaryText font-semibold line-clamp-2">
                {getText(prodList[0].name, prodList[0].nameMM, locale)}
              </h3>
              <div className="flex flex-row items-center gap-3 text-gray-600">
                <Avatar
                  username={prodList[0].seller.username}
                  profile={prodList[0].seller.profile}
                />
                <p className="text-sm line-clamp-1">
                  {prodList[0].seller.displayName
                    ? prodList[0].seller.displayName
                    : prodList[0].seller.username}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-[250px] lg:ml-[250px] lg:mt-0 px-5 w-full">
            <div
              className="text-sm"
              dangerouslySetInnerHTML={{
                __html: getText(
                  prodList[0].shortDescription,
                  prodList[0].shortDescriptionMM,
                  locale
                ),
              }}
            />
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 w-full">
              <div className="flex flex-col gap-3 items-center flex-1">
                <div className="flex flex-row items-center gap-3">
                  <h3 className="font-medium text-gray-200">{t("price")}</h3>
                  {pricingInfo.isPromotion === true ? (
                    <span className="bg-primary text-white rounded-md px-2 py-1 text-sm font-semibold">
                      {prodList[0].type === ProductType.Variable &&
                      pricingInfo.maxSaleDiscount !==
                        pricingInfo.minSaleDiscount
                        ? "Up to " + pricingInfo.maxSaleDiscount
                        : prodList[0].type === ProductType.Variable
                        ? pricingInfo.maxSaleDiscount
                        : pricingInfo.discount}
                      % OFF
                    </span>
                  ) : (
                    <></>
                  )}
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
                <p className="text-xl font-bold">
                  {pricingInfo.isPromotion &&
                  prodList[0].type === ProductType.Fixed
                    ? formatAmount(pricingInfo.salePrice, locale, true)
                    : pricingInfo.isPromotion === true &&
                      pricingInfo.minSalePrice !== pricingInfo.maxSalePrice
                    ? formatAmount(pricingInfo.minSalePrice, locale, false) +
                      " - " +
                      formatAmount(pricingInfo.maxSalePrice, locale, true)
                    : pricingInfo.isPromotion === true
                    ? formatAmount(pricingInfo.minSalePrice, locale, true)
                    : prodList[0].type === ProductType.Fixed
                    ? formatAmount(pricingInfo.regularPrice, locale, true)
                    : pricingInfo.minRegPrice !== pricingInfo.maxRegPrice
                    ? formatAmount(pricingInfo.minRegPrice, locale, false) +
                      " - " +
                      formatAmount(pricingInfo.maxRegPrice, locale, true)
                    : formatAmount(pricingInfo.regularPrice, locale, true)}
                </p>

                <p></p>
              </div>
              <div className="flex flex-col gap-3 items-center flex-1">
                <h3 className="font-medium text-gray-200">
                  {t("stockAvailability")}
                </h3>
                {prodList[0].type === ProductType.Fixed ? (
                  <p
                    className={`${
                      prodList[0].stockType === StockType.InStock
                        ? "bg-success"
                        : prodList[0].stockType === StockType.OutOfStock
                        ? "bg-error"
                        : prodList[0].stockType === StockType.StockLevel
                        ? "bg-warning"
                        : "bg-success"
                    } p-2 rounded-md text-sm font-semibold`}
                  >
                    {prodList[0].stockType === StockType.InStock
                      ? t("inStock")
                      : prodList[0].stockType === StockType.OutOfStock
                      ? t("outOfStock")
                      : prodList[0].stockType === StockType.StockLevel
                      ? t("quantity").replace(
                          "{data}",
                          formatAmount(prodList[0].stockLevel, locale)
                        )
                      : t("inStock")}
                  </p>
                ) : (
                  <p></p>
                )}
              </div>
              <div className="flex flex-row items-center gap-3 flex-1 justify-end mt-3 lg:mt-5">
                <button className="bg-primary text-white rounded-md px-3 py-3 flex-1 text-sm hover:bg-primary-focus transition">
                  {t("buyNow")}
                </button>
                <button className="bg-slate-600 text-white rounded-md px-3 py-3 flex-1 text-sm hover:bg-slate-700 transition">
                  {t("seeDetails")}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 lg:mt-20 flex flex-row items-center justify-between gap-5 w-full">
          <h3 className="font-semibold text-lg">{t("highlightProducts")}</h3>
          <Link
            href="/marketplace"
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
          {categories.map((z: any, index: number) => (
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
            ? z.id !== prodList[0].id
            : z.id !== prodList[0].id &&
              z.categoryIds.find((b) => b === current)
        ).length > 0 ? (
          <div className="mt-3 flex flex-row max-w-screen-xl overflow-auto scrollbar-hide pb-5">
            {prodList
              .filter((z) =>
                current === ""
                  ? z.id !== prodList[0].id
                  : z.id !== prodList[0].id &&
                    z.categoryIds.find((b) => b === current)
              )
              .map((z, index) => (
                <div
                  key={index}
                  className="max-w-[200px] overflow-hidden flex flex-col gap-3 rounded-md cursor-pointer bg-white"
                >
                  <div className="overflow-hidden">
                    <ProductImg
                      imgUrl={fileUrl + z.imgList[0]}
                      title={z.name}
                      roundedAll={false}
                      width={200}
                    />
                  </div>
                  <div className="flex flex-col gap-3 text-primaryText p-3">
                    <h3 className="text-primaryText font-semibold line-clamp-2">
                      {getText(z.name, z.nameMM, locale)}
                    </h3>

                    <p className="text-sm mb-3">
                      {z.type === ProductType.Fixed
                        ? getPricing(z).isPromotion === true
                          ? formatAmount(getPricing(z).salePrice, locale, true)
                          : formatAmount(
                              getPricing(z).regularPrice,
                              locale,
                              true
                            )
                        : getPricing(z).isPromotion === true &&
                          getPricing(z).minSalePrice ===
                            getPricing(z).maxSalePrice
                        ? formatAmount(getPricing(z).minSalePrice, locale, true)
                        : getPricing(z).isPromotion === true
                        ? formatAmount(
                            getPricing(z).minSalePrice,
                            locale,
                            false
                          ) +
                          " - " +
                          formatAmount(getPricing(z).maxSalePrice, locale, true)
                        : getPricing(z).minRegPrice ===
                          getPricing(z).maxRegPrice
                        ? formatAmount(getPricing(z).minRegPrice, locale, true)
                        : formatAmount(
                            getPricing(z).minRegPrice,
                            locale,
                            false
                          ) +
                          " - " +
                          formatAmount(getPricing(z).maxRegPrice, locale, true)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="grid h-[300px] px-4 place-content-center">
            <h1 className="tracking-widest text-white uppercase">
              {current === ""
                ? t("browsedAllProducts")
                : getText(
                    "No products related to " +
                      categories.find((b) => b.id === current).name,
                    +categories.find((b) => b.id === current).nameMM +
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
